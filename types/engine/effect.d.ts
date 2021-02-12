import { Myou } from "./myou";
import { Viewport } from "./viewport";
import { BaseFilter } from "./filter"

export class BaseEffect {
    context: Myou
    viewport: Viewport;
    constructor(context: Myou);
    on_viewport_update(viewport: Viewport): void;
    apply(source: unknown, temporary: unknown, rect: unknown): {
        destination: typeof source,
        temporary: typeof temporary
    };
    on_viewport_remove(): void;
}

export class FilterEffect extends BaseEffect {
    filter: BaseFilter;
    constructor(context: Myou, filter: BaseFilter)
}

export class CopyEffect extends FilterEffect {}

export class BloomEffect extends BaseEffect {

}