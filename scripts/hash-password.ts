import bcrypt from "bcryptjs";
import { createInterface } from "node:readline";

// Uso:
//   npm run admin:hash                       (pide la contraseña sin mostrarla)
//   npm run admin:hash -- "mi contraseña"    (queda en el historial de la terminal)

const COST = 12;

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    let muted = false;
    // Silencia el eco de lo que se escribe, pero no la pregunta.
    const writable = rl as unknown as {
      _writeToOutput: (text: string) => void;
    };
    const original = writable._writeToOutput.bind(rl);
    writable._writeToOutput = (text) => {
      if (!muted) original(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const password = process.argv[2] ?? (await promptHidden("Contraseña: "));

  if (password.length < 10) {
    console.error("Usá una contraseña de al menos 10 caracteres.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, COST);
  // Next.js expande "$VAR" en los .env: hay que escapar cada "$" del hash.
  const escaped = hash.replaceAll("$", "\\$");

  console.log("\nPegá esta línea en tu .env local:\n");
  console.log(`ADMIN_PASSWORD_HASH=${escaped}`);
  console.log(
    "\nEn Vercel (Settings > Environment Variables) pegá el hash SIN las barras invertidas:",
  );
  console.log(hash);
}

main();
