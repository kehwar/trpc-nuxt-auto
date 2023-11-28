import _ from 'lodash'
import * as path from 'pathe'
import type { Options } from './options'

export function parseProcedurePath(file: string, { cwd, queryPrefixes, mutationPrefixes, subscriptionPrefixes, defaultAction }: Options) {
    const relativePath = path.relative(cwd, file)
    const routerPathName = path.dirname(relativePath).split(path.sep).map(dir => _.camelCase(dir)).join('.')
    const procedureName = _.camelCase(path.basename(relativePath, path.extname(relativePath)).split('.').slice(0, -1).join('_'))
    const importPath = path.join(cwd, path.dirname(relativePath), path.basename(relativePath, path.extname(relativePath)))
    const importName = [_.camelCase(routerPathName), procedureName].join('_')
    const procedurePrefix = _.kebabCase(procedureName).split('-')[0]
    const action = queryPrefixes.includes(procedurePrefix)
        ? 'query'
        : mutationPrefixes.includes(procedurePrefix)
            ? 'mutation'
            : subscriptionPrefixes.includes(procedurePrefix)
                ? 'subscription'
                : defaultAction
    if (action === 'error')
        throw createError(`Could not guess action for ${file}`)
    return {
        routerPathName,
        procedureName,
        importPath,
        importName,
        action,
    }
}
export type TRPCProcedure = ReturnType<typeof parseProcedurePath>