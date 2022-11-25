# File Tree to JSON Action

GitHub action to tree files in the repository and convert them to JSON.

## Inputs
| Input                           | Description                                |
|---------------------------------|--------------------------------------------|
| `search-path` (required)        | Path to search files                       |
| `max-depth`  (optional => 10)   | Depth of tree to search                    |
| `only-dirs` (optional => false) | Only include directories in output?        |
| `extension`  (optional)         | File extension to match                    |
| `end-with-array`  (optional)    | Whether the final depth should be an array |

## Outputs

| Output | Description                 |
|--------|-----------------------------|
| `tree` | Tree of the file directory. |

## Usage example

```yaml
name: Test
on:
  push:
    tags-ignore:
      - '*'
    branches:
      - 'mainline'
  pull_request:
  workflow_dispatch:

jobs:
  list-files:
    runs-on: ubuntu-latest
    outputs:
      paths: ${{ steps.list-files.outputs.tree }}
    steps:
      - name: List Files
        id: list-files
        uses: adairrr/file-tree-to-json-action@v1
        with:
          search-path: .github
          max-depth: 5
          only-dirs: false
          end-with-array: true
  #          extension: ".yml"

  test:
    needs: list-files
    runs-on: ubuntu-latest
    steps:
      - name: Print the output tree
        run: echo ${{ needs.list-files.outputs.tree }}
```
Output generated for the above yaml file (in this repository):

```json
{
  "workflows": {
    "check-dist.yml": null,
    "codeql-analysis.yml": null,
    "test.yml": null
  },
  "dependabot.yml": null
}
```
Note that directories will end in a '[]' and files will end in a null if fully traversed.

## License
[MIT license]

[MIT license]: LICENSE
