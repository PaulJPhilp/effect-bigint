import * as Context from './Context.js'

export interface Visitable<T> { 
    accept(visitor: Visitor<T>): void
}

export interface VisitableImpl<T> { 
    accept(visitor: Visitable<T>): void
}

export const Visitable = Context.Tag("@app/Visitable");

export interface Visitor<T> { 

    visit(element: Visitable<T>): void;
}

export interface VisitorImpl<T> { 
    accept(visitor: Visitable<T>): void
}

export const Visitor = Context.Tag("@app/Visitor");

abstract class AbstractVisitable<T extends Object> implements Visitable<T> {
  public abstract _tag: string;

  // double dispatch pattern
  public accept(visitor: Visitor<T>): void {
    visitor.visit(this);
  }
}

class Tree {
    node: any
    left: Tree|null = null
    right: Tree|null = null
}

class TreeVisitor implements AbstractVisitable<Tree> {
    public _tag: string = "Tree"

    accept(tree: Visitable<Tree>) {}

}

const tree1: Tree = {node: "string", left: null, right: null}
