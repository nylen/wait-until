module.exports = exports = function waitUntil(interval, times, condition, cb) {
    if (typeof interval == 'undefined') {
        return new WaitUntil();
    } else {
        return new WaitUntil()
            .interval(interval)
            .times(times)
            .condition(condition)
            .done(cb);
    }
};

//100 millisecond intervals over 10 seconds
var defaults = {
    interval: 100,
    times: 100,
}

function WaitUntil() {
    var self = this;
}

WaitUntil.prototype.interval = function(_interval) {
    var self = this;

    self._interval = _interval;
    return self;
};

WaitUntil.prototype.times = function(_times) {
    var self = this;

    self._times = _times;
    return self;
};

WaitUntil.prototype.defaults = function(_newDefaults) {
    var self = this;

    for (var property in _newDefaults) {
        defaults[property] = _newDefaults[property];
    }

    return self;
};

WaitUntil.prototype.condition = function(_condition, cb) {
    var self = this;

    self._condition = _condition;
    if (cb) {
        return self.done(cb);
    } else {
        return self;
    }
};

WaitUntil.prototype.done = function(cb) {
    var self = this;

    if (!self._times) {
        self._times = defaults.times;
    }
    if (!self._interval) {
        self._interval = defaults.interval;
    }
    if (!self._condition) {
        throw new Error('waitUntil.condition() not called yet');
    }

    (function runCheck(i, prevResult) {
        if (i == self._times) {
            cb(prevResult);
        } else {
            setTimeout(function() {
                function gotConditionResult(result) {
                    if (result) {
                        cb(result);
                    } else {
                        runCheck(i + 1, result);
                    }
                }

                if (self._condition.length) {
                    self._condition(gotConditionResult);
                } else {
                    // don't release Zalgo
                    process.nextTick(function() {
                        gotConditionResult(self._condition());
                    });
                }
            }, self._interval);
        }
    })(0);

    return self;
};
