# Engine

## Task

A `task` is an *Object* matching the following interface:

```js
ITask {
  name: String
  shouldRun: ((): Boolean)
  run: ((): Promise<Result>)
}
```
