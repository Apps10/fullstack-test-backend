import zod from 'zod'
import { config } from 'dotenv'


const envSchema = zod.object({
  PORT: zod.string().transform((val) => parseInt(val)).nonoptional(),
  DATABASE_URL:  zod.string().nonempty(),
  UAT_SANDBOX_URL:  zod.string().nonempty(),
  UAT_SANDBOX_PUBLIC_KEY:  zod.string().nonempty(),
  UAT_SANDBOX_PRIVATE_KEY:  zod.string().nonempty(),
  UAT_SANDBOX_INTEGRITY_KEY:  zod.string().nonempty(),
})

type IEnv = zod.infer<typeof envSchema>

class Env {
  private static envs: IEnv

  private constructor(){}

  public static getInstance(): IEnv{
    config()
    if(!Env.envs){
      const result = envSchema.safeParse(process.env)
      if(result?.error){
        console.error(`
          ❌ Invalid environment variables: ${JSON.stringify(result.error.format())}
        `)
        throw new Error('Invalid Environment variables')
      }
      Env.envs = result?.data
    }
    return Env.envs
  }
}

export const {
  PORT,
  DATABASE_URL,
  UAT_SANDBOX_INTEGRITY_KEY,
  UAT_SANDBOX_PRIVATE_KEY,
  UAT_SANDBOX_PUBLIC_KEY,
  UAT_SANDBOX_URL,
}: IEnv = Env.getInstance()