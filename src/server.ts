import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

//  --respawn : Automatically restarts the process if it dies (e.g. on crash).
//  --transpile-only : Skips type checking to speed up the compilation by only transpiling TypeScript to JavaScript.
//"dev": "ts-node-dev --respawn --transpile-only src/server.ts",
//"dev": "ts-node-dev src/server.ts",
  // "main": "server.ts",