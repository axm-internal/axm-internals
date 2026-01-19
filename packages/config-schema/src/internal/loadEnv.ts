import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

export const loadEnv = (dir: string) => {
    // Always load .env first
    const base = dotenv.config({ path: `${dir}/.env` });
    dotenvExpand.expand(base);

    const env = process.env.NODE_ENV;
    if (env) {
        const specific = dotenv.config({ path: `${dir}/.env.${env}`, override: true });
        dotenvExpand.expand(specific);
    }
};
