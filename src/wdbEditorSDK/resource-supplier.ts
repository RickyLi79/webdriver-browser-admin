import { wdbResourceApi } from '@/api/wdb';
import {
  type WdbEditorSDK,
  RESOURCE_SCOPE,
  RQResponseStatus,
  ResourceRequestMethods,
  ResourceRef,
} from 'webdriver-browser-core';

let inited = false;
export function setupResourceSupplier(sdk: WdbEditorSDK) {
  if (inited) return;
  inited = true;
  sdk.requestQueueReviver.setScopeHandler(RESOURCE_SCOPE, async ({ scope, request, data }) => {
    if (scope !== RESOURCE_SCOPE || request !== ResourceRequestMethods.LOAD)
      return {
        status: RQResponseStatus.UNKNOWN,
      };

    const { project, version, fullId } = data as ResourceRef;
    for (const iVersion of version) {
      const resource = await wdbResourceApi.getResourceContentByFullId({
        project,
        fullId,
        version: iVersion,
      });
      if (resource)
        return {
          status: RQResponseStatus.OK,
          data: resource,
        };
    }

    return { status: RQResponseStatus.NOT_FOUND };
  });
}
