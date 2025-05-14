'use server'
import { submitUserMessage } from './7_multi-step-gen-ui';
import {createAI} from "ai/rsc";

export const AI = createAI<any[], React.ReactNode[]>({
  initialUIState: [],
  initialAIState: [],
  actions: {
    submitUserMessage,
  },
});
