import { WdbEditorSDK, initExecuteScriptSender } from 'webdriver-browser-core';

let wdbEditorSDK: WdbEditorSDK;
let inited = false;
async function setup() {
  if (inited) {
    return;
  }
  inited = true;
  const executeScriptSender = initExecuteScriptSender();

  try {
    await fetch('wdbLib/wdbLib.js?' + Date.now(), { cache: 'no-cache' })
      .then((res) => {
        return res.text();
      })
      .then(async (initScript) => {
        wdbEditorSDK = await WdbEditorSDK.getSingleton({
          initScript,
          scriptExecutor: executeScriptSender,
        });
      });
  } catch (err) {
    inited = false;
    throw err;
  }
}

export { wdbEditorSDK };

export async function setupWdbEditorSdk() {
  await setup();
  return wdbEditorSDK;
}
