import { createContext, useContext } from 'react';

/** True inside the dashboard/admin shell, which already provides page width and gutters. */
export const InShellContext = createContext(false);
export const useInShell = () => useContext(InShellContext);
