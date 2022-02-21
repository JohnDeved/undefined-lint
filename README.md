1. install package `npm i JohnDeved/undefined-lint`

2. create `.eslintrc` file in your project root
```json
{
    "extends": [
        "./node_modules/@undefined/lint/.eslintrc"
    ]
}
```

eslint is required to run on node 16
you may have to add `"eslint.runtime": "node",` in your vscode settings for eslint to use your local node16 installation.
