import { useFonts as useExpoFonts } from 'expo-font';
import { Lora_400Regular, Lora_600SemiBold } from '@expo-google-fonts/lora';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';

export function useFonts(): { loaded: boolean; error: Error | null } {
  const [loaded, error] = useExpoFonts({
    Lora: Lora_400Regular,
    'Lora-SemiBold': Lora_600SemiBold,
    'IBM Plex Mono': IBMPlexMono_400Regular,
  });

  return { loaded: loaded ?? false, error: error as Error | null };
}
