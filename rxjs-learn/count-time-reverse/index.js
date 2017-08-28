
//--------------------time--------------------
const countdownSeconds = 60;
const setHTML = id => val => document.getElementById(id).innerHTML = val;
const pauseButton = document.getElementById('pause');
const resumeButton = document.getElementById('resume');
const interval$ = Rx.Observable.interval(1000).mapTo(-1);

const pause$ = Rx.Observable.fromEvent(pauseButton, 'click').mapTo(Rx.Observable.of(false));
const resume$ = Rx.Observable.fromEvent(resumeButton, 'click').mapTo(interval$);

const timer$ = Rx.Observable
    //执行完merge这时候流中有两个流中流对象(Observable的observable)
    .merge(pause$, resume$, Rx.Observable.of(interval$))
    //执行完startWith这时候流中有三个流中流（Observable中的值仍然是Observable对象）
    //.startWith(interval$) 
    /*
     *  每当流中有Observable对象的对象更新都会使用switchMap映射到一个新的Observable对象,这里分三种情况
        1.初始进入页面，interval$对象会首先通过switchMap将自己返回作为一个1s发出一个值的Observable对象
        2.点击pause的时候，这是用switchMap会更新发出的Observable对象为Rx.Observable.of(false)
        3.点击resume的时候，这是用switchMap会更新发出的Observable对象为interval$
     */
    .switchMap(val => val) //此处的val才是单层的Observable对象
    /*
     * 1.初始状态的Observable对象为interval$
     * 2.点击pause时候的Observable对象为Rx.Observable.of(false)
     * 3.点击resume时候的Observable对象为interval$
     */
    .scan((acc, curr) => curr ? curr + acc : acc, countdownSeconds)
    .subscribe(setHTML('remaining'))
/*
所以上述也可以写成下述形式，保证起始流中有是三个流中流对象即可
const timer$ = Rx.Observable.merge(pause$, resume$, Rx.observable.of(interval$))
    .switchMap(val => val)
    .scan((acc, curr) => curr ? curr + acc : acc, countdownSeconds)
    .subscribe(setHTML('remaining'))
*/
