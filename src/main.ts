import * as core from '@actions/core'
import fs from 'fs-extra'
import path from 'path'

// TODO: allow user-defined ignored
const EXCLUDED_FOLDERS = ['.git', '.github', 'node_modules', 'dist', 'build', '.idea']

interface TraversalOptions {
  onlyDirs: boolean
  endWithArray: boolean
  extension: string
}

/**
 * Traverse the directory to the depth provided.
 */
async function traverse(
  dir: string,
  depth: number,
  options: TraversalOptions,
  result: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  if (depth === 0) return result

  const fileList = await fs.readdir(dir)

  // should this be defined above and passed in?
  const shouldIncludeFile = (file: string) => {
    const included = !EXCLUDED_FOLDERS.includes(file)
    const hasValidExtension =
      !options.extension ||
      file.endsWith(options.extension.startsWith('.') ? options.extension : `.${options.extension}`)
    return included && hasValidExtension
  }

  for (const file of fileList.filter(shouldIncludeFile)) {
    const filePath = path.join(dir, file)
    const stats = await fs.stat(filePath)

    if (stats.isDirectory()) {
      if (depth === 1) {
        // write the last depth as an array
        const finalTraversal = ((await fs.readdir(filePath)) || []).filter(shouldIncludeFile)

        result[file] = options.endWithArray
          ? finalTraversal
          : Object.fromEntries(finalTraversal.map(f => [f, {}]))

      } else {
        // @ts-ignore
        const traversal = await traverse(filePath, depth - 1, options)
        // end on an array for directories
        result[file] = Object.keys(traversal).length ? traversal : []
      }
    } else if (!options.onlyDirs) {
      // User-provided terminator?
      result[file] = null
    }
  }
  return result
}

async function run(): Promise<void> {
  try {
    const maxDepth = Number(core.getInput('max-depth'))
    const searchPath = core.getInput('search-path')
    const onlyDirs = core.getInput('only-dirs') === 'true'
    const extension = core.getInput('extension')
    const endWithArray = core.getInput('end-with-array') === 'true'

    const options: TraversalOptions = {
      onlyDirs,
      extension,
      endWithArray
    }

    core.debug(`options: ${JSON.stringify(options)}`)

    const tree = await traverse(searchPath, maxDepth - 1, options)

    core.setOutput('tree', JSON.stringify(tree, null, 2))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
