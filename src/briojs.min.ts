import { newApp, setup } from "./app";
import { setAllDirectives } from "./directives";

setup({
    newApp: () => {
        let app = newApp();

        // Load all directives
        setAllDirectives(app);

        // each(queryAll(`[b-${HYDRATE}]`), el => app.gc.$dom[HYDRATE](el));

        return app;
    }
});