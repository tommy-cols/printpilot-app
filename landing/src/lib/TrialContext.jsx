import React, { createContext, useContext, useState } from 'react';

// Configuration for trial features
// Set SHOW_TRIAL_FEATURES to false to completely disable trial UI elements
const SHOW_TRIAL_FEATURES = true;

const TrialContext = createContext();

export function TrialProvider({ children }) {
  // This could be fetched from API or environment variable in the future
  const [showTrialFeatures] = useState(SHOW_TRIAL_FEATURES);

  const value = {
    // Whether to show trial-related UI (banners, upgrade prompts, etc.)
    showTrialFeatures,
  };

  return (
    <TrialContext.Provider value={value}>
      {children}
    </TrialContext.Provider>
  );
}

export function useTrialConfig() {
  const context = useContext(TrialContext);
  if (!context) {
    // Return default values if used outside provider (for backwards compatibility)
    return { showTrialFeatures: SHOW_TRIAL_FEATURES };
  }
  return context;
}

export default TrialContext;
