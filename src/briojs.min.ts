import { newApp, setup } from "./app";
import { setAllDirectives } from "./directives";

setup({
    newApp: () => {
        let app = newApp();

        // Load all directives
        setAllDirectives(app);

        return app;
    }
});