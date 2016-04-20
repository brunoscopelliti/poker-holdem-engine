
'use strict';

// from Async & Performance
// by Kyle '@getify' Simpson

exports.run = function run(gen) {

  var args = [].slice.call(arguments, 1)

  // initialize the generator in the current context
  var it = gen.apply(this, args);

  // return a promise for the generator completing
  return Promise.resolve()
    .then(function handleNext(value){

      // run to the next yielded value
      var next = it.next(value);

      return (function handleResult(next){

        if (next.done) {
          // generator has completed running
          return next.value;
        }
        else {

          //
          // handleNext
          // resume the async loop on success,
          // sending the resolved value back into the generator

          //
          // handleErr
          // if `value` is a rejected promise,
          // propagate error back into the generator for its own error handling

          return Promise.resolve(next.value)
            .then(handleNext, function handleErr(err) {
              return Promise.resolve(it.throw(err)).then(handleResult);
            });

        }

      })(next);

    });
}
