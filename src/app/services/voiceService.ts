// Voice service for text-to-speech announcements
let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

// Pre-load voices
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    voicesLoaded = true;
  };
}

// Cache a single voice - use native macOS female voice
function getVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  
  // Priority: macOS/standard English female voices
  cachedVoice = voices.find(v => v.name.includes('Samantha')) || // macOS female
               voices.find(v => v.name.includes('Victoria')) || // macOS female
               voices.find(v => v.name.includes('Google UK English Female')) ||
               voices.find(v => v.name.includes('Microsoft Zira')) ||
               voices.find(v => v.name.toLowerCase().includes('female')) ||
               voices.find(v => v.lang === 'en-GB') ||
               voices.find(v => v.lang === 'en-US') ||
               voices[0];
  
  return cachedVoice;
}

export function speak(text: string, rate: number = 1) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    // Get the cached voice (or find one if not cached yet)
    let voice = getVoice();
    
    // If voices not loaded yet, wait and retry
    if (!voice) {
      setTimeout(() => speak(text, rate), 100);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    // Use higher pitch to ensure female sound
    utterance.pitch = 1.5; 
    utterance.lang = 'en-US';
    utterance.voice = voice;
    
    window.speechSynthesis.speak(utterance);
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Short concise announcements
export function announceNavigationStart(from: string, to: string, timeMinutes: number, distance: number) {
  speak(`Trip to ${to}. ${timeMinutes} minutes, ${distance} kilometers.`);
}

export function announceArrival(destination: string) {
  speak(`Arrived at ${destination}`);
}

export function announcePaymentSuccess(amount: number) {
  speak(`Payment successful. ${amount} rupees.`);
}

export function announcePaymentFailure(error: string) {
  speak(`Payment failed. ${error}`);
}

export function announceProgress(progress: number) {
  if (progress === 25) speak('25 percent complete');
  else if (progress === 50) speak('Halfway there');
  else if (progress === 75) speak('75 percent complete');
  else if (progress >= 100) speak('Arrived');
}
