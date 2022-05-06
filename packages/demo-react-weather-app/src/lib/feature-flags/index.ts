import { FlagEvaluationDetails, openfeature } from '@openfeature/openfeature-js'
import {OpenFeatureSplitProvider} from '@openfeature/js-split-provider'
import { useEffect, useState } from 'react';

const { SplitFactory } = require('@splitsoftware/splitio');
export function initializeOFeat(){
  const splitClient = SplitFactory({
    core: {
      authorizationKey: process.env['NX_SPLIT_KEY'] ?? '',
    },
  }).client()
  openfeature.registerProvider(new OpenFeatureSplitProvider({splitClient}))
}

export function useBooleanFeatureFlag(flagName:string,defaultValue:boolean){
  const [flagEvaluationDetails,setFlagEvaluationDetails] = useState<FlagEvaluationDetails<boolean>|null>(null)

  const ofContext = {userId:'anon'}
  const client = openfeature.getClient(undefined,undefined,ofContext)

  useEffect(()=>{
    async function getFlag(){
      const flagDetails = await client.getBooleanDetails(flagName,defaultValue)
      console.log({flagDetails})
      setFlagEvaluationDetails(flagDetails)
    }

    getFlag();
  },[flagName,defaultValue])

  if(flagEvaluationDetails){
    return flagEvaluationDetails.value;
  }else{
    return defaultValue
  }

}