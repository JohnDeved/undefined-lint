1. make sure you dont already have eslint installed in your project (uninstall it first if you do)

2. install package `npm i JohnDeved/undefined-lint`

3. create `.eslintrc` file in your project root
```json
{
    "extends": [
        "./node_modules/@undefined/lint/.eslintrc"
    ]
}
```

4. check if you are running node 16. eslint is required to run on node 16.
you may have to add `"eslint.runtime": "node",` in your vscode settings for eslint to use your local node16 installation.

recommended workspace settings:
```json
{
    "eslint.runtime": "node",
    "editor.tabSize": 2,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true,
      "source.fixAll.stylelint": true
    }
}
```
