import * as nodePath from 'path';

/**
 * The subset of Node's path API used for marker resolution. Kept injectable so the
 * Windows-specific edge cases (drive roots, UNC roots) can be exercised on any host.
 */
export type PathApi = Pick<nodePath.PlatformPath, 'dirname' | 'normalize' | 'sep'>;

export interface AncestorOptions {
    /**
     * Directory to stop at, inclusive. Typically the workspace folder root, so markers
     * outside the workspace are never inherited.
     */
    boundary?: string;
    /** Path implementation to walk with. Defaults to the host platform's. */
    pathApi?: PathApi;
}

export type MarkerSource = 'self' | 'inherited';

export interface ResolvedMarker {
    emoji: string;
    /** Path the marker is stored on: the item itself, or the nearest marked ancestor folder. */
    ownerPath: string;
    source: MarkerSource;
}

/**
 * Bring a path into the shape `dirname()` emits: normalized, and without a trailing
 * separator unless it is a root (`/`, `C:\`, `\\server\share`).
 */
function canonicalize(value: string, pathApi: PathApi): string {
    const normalized = pathApi.normalize(value);

    if (normalized.length > 1 &&
        normalized.endsWith(pathApi.sep) &&
        pathApi.dirname(normalized) !== normalized) {
        return normalized.slice(0, -1);
    }

    return normalized;
}

/**
 * Ancestor directories of `fsPath`, nearest first, stopping at the filesystem root or at
 * `options.boundary` (whichever comes first).
 *
 * Note this is a lexical walk: symlinked paths resolve against the path as written, not
 * against the link target, which matches how the explorer addresses the item.
 */
export function getAncestorPaths(fsPath: string, options: AncestorOptions = {}): string[] {
    const pathApi = options.pathApi ?? nodePath;
    const boundary = options.boundary === undefined
        ? undefined
        : canonicalize(options.boundary, pathApi);

    const ancestors: string[] = [];
    let current = canonicalize(fsPath, pathApi);

    // The boundary is itself never walked past, so the boundary directory has no
    // ancestors of its own to inherit from.
    if (current === boundary) {
        return ancestors;
    }

    for (;;) {
        const parent = pathApi.dirname(current);

        // dirname() is a fixed point at every root ('/' -> '/', 'C:\' -> 'C:\',
        // '\\server\share' -> '\\server\share'), so the walk has to terminate by
        // comparing against the *current* path, not against the path it started from.
        if (parent === current) {
            break;
        }

        current = parent;
        ancestors.push(current);

        if (boundary !== undefined && current === boundary) {
            break;
        }
    }

    return ancestors;
}

/**
 * Resolve the emoji shown for `fsPath`: an explicit marker on the item itself wins over
 * anything inherited, and the nearest marked ancestor wins over more distant ones.
 */
export function resolveMarker(
    fsPath: string,
    lookup: (candidatePath: string) => string | undefined,
    options: AncestorOptions = {}
): ResolvedMarker | undefined {
    const own = lookup(fsPath);
    if (own) {
        return { emoji: own, ownerPath: fsPath, source: 'self' };
    }

    for (const ancestor of getAncestorPaths(fsPath, options)) {
        const inherited = lookup(ancestor);
        if (inherited) {
            return { emoji: inherited, ownerPath: ancestor, source: 'inherited' };
        }
    }

    return undefined;
}
