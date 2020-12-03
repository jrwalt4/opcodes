import { BackendFactory } from "dnd-core";

declare module "react-dnd-mouse-backend" {
    let backend: BackendFactory;
    export = backend;
}
