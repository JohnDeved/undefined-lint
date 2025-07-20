## Quick Setup (one-liner)

You can set up ESLint in your project with a single command:

```
npx github:JohnDeved/undefined-lint
```

---

Manual steps (if you prefer):

1. Make sure you don't already have eslint installed in your project (uninstall it first if you do)
2. Make sure you have a `tsconfig.json` in your project root.
3. Install the package:
   ```sh
   npm i JohnDeved/undefined-lint
   ```
4. Create `.eslintrc` file in your project root:
   ```json
   {
     "extends": [
       "./node_modules/@undefined/lint/.eslintrc"
     ]
   }
   ```
5. (Recommended) Add workspace settings `.vscode/settings.json` (the script does this for you, but you can also add manually):
   ```json
   {
      "eslint.runtime": "node",
      "editor.tabSize": 2,
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit"
      }
   }
   ```