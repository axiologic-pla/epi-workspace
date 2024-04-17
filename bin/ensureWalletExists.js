require("../opendsu-sdk/builds/output/openDSU");
const openDSU = require("opendsu");
const scAPI = openDSU.loadAPI("sc");
const enclaveAPI = openDSU.loadAPI("enclave");
const config = openDSU.loadAPI("config");

const ensureWalletExists = async () => {
    let sharedEnclaveSSI = await $$.promisify(config.getEnv)(openDSU.constants.SHARED_ENCLAVE.KEY_SSI);

    if (typeof sharedEnclaveSSI === "undefined") {
        const sharedEnclave = enclaveAPI.initialiseWalletDBEnclave();
        sharedEnclave.on("initialised", async () => {
            try {
                await $$.promisify(scAPI.setSharedEnclave)(sharedEnclave);
            } catch (e) {
                throw createOpenDSUErrorWrapper("Failed to set shared enclave", e);
            }
        })
    }
}

ensureWalletExists();