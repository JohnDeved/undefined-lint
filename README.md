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

recommended workspace settings `.vscode/settings.json`:
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
