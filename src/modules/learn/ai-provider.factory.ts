import { AIProvider } from './ai-provider.interface';
import { CencoriProvider } from './providers/cencori.provider';
import { LuaProvider } from './providers/lua.provider';

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'cencori';

  switch (provider.toLowerCase()) {
    case 'lua':
      return new LuaProvider();
    case 'cencori':
      return new CencoriProvider();
    default:
      throw new Error(`Unknown AI_PROVIDER: ${provider}. Must be 'cencori' or 'lua'.`);
  }
}
