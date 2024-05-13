
/**
 * @since 3.0.0
 */

import * as Inspectable from './Inspectable.js'

type VoidFunction = () => void

/**
 * @since 3.0.0
 * @category symbol
 */

export const TypeId: unique symbol = Symbol.for("effect/Explorer")
export type TypeId = typeof TypeId
export const ExploreableTypeId: unique symbol = Symbol.for("effect/Exploreable")
export type ExploreableTypeId = typeof ExploreableTypeId
export const ExploreableSymbol = Symbol.for("nodejs.util.exploreable.custom")
export type ExploreableSymbol = typeof ExploreableSymbol
export const ExplorerSymbol = Symbol.for("nodejs.util.explorer.custom")
export type ExplorerSymbol = typeof ExplorerSymbol

/**
 * @since 3.0.0
 * @category models
 */
export interface Exploreable extends Inspectable.Inspectable {
    accept: VoidFunction
    toJSON(): unknown
    toString(): string
}

export abstract class ExploreableClass implements Inspectable.Inspectable, Exploreable {
    abstract accept(): unknown
    abstract toJSON(): unknown
    [ExploreableSymbol]() {
        return this.accept()
    }
    [Inspectable.NodeInspectSymbol]() {
        return this.toJSON()
    }
}

export interface Explorer {
    readonly [ExploreableSymbol]: unknown
    explore: (item: Exploreable) => void
}

export abstract class ExplorerClass {
    abstract explore(item: Exploreable): unknown
    [ExploreableSymbol](item: Exploreable) {
        return this.explore(item)
    }
}

/***
class Shapes extends ExploreableClass {
    public Square = "Square"
    public Circle = "Circle"
    accept() {
        console.log("Circle")
        console.log("Square")
    }
    toJSON() {
        return JSON.stringify([this.Circle, this.Square])
    }
}


class ShapesExplorer extends ExplorerClass {

    item: ExploreableClass
    constructor(item: Shapes) {
        super()
        this.item = item
    }

    explore() {
        this.item.accept()
    }
}



const shapes = new Shapes()
const explorer: ShapesExplorer = new ShapesExplorer(shapes)
explorer.explore()
shapes.toJSON()
***/
