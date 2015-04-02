function MentoringStandardView(runtime, element, mentoring) {
    var submitXHR;
    var submitDOM, messagesDOM;

    var callIfExists = mentoring.callIfExists;

    function handleSubmitResults(response) {
        messagesDOM.empty().hide();

        $.each(response.results || [], function(index, result_spec) {
            var input = result_spec[0];
            var result = result_spec[1];
            var child = mentoring.getChildByName(element, input);
            var options = {
                max_attempts: response.max_attempts,
                num_attempts: response.num_attempts
            };
            callIfExists(child, 'handleSubmit', result, options);
        });

        $('.attempts', element).data('max_attempts', response.max_attempts);
        $('.attempts', element).data('num_attempts', response.num_attempts);
        mentoring.renderAttempts();

        // Messages should only be displayed upon hitting 'submit', not on page reload
        mentoring.setContent(messagesDOM, response.message);
        if (messagesDOM.html().trim()) {
            messagesDOM.prepend('<div class="title1">Feedback</div>');
            messagesDOM.show();
        }

        submitDOM.attr('disabled', 'disabled');
    }

    function calculate_results(handler_name){
        var data = {};
        var children = mentoring.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child && child.name !== undefined) {
                data[child.name] = callIfExists(child, handler_name);
            }
        }
        var handlerUrl = runtime.handlerUrl(element, handler_name);
        if (submitXHR) {
            submitXHR.abort();
        }
        submitXHR = $.post(handlerUrl, JSON.stringify(data)).success(handleSubmitResults);
    }

    function get_results() {
        calculate_results('get_results');
    }

    function submit() {
        calculate_results('submit')
    }

    function clearResults() {
        messagesDOM.empty().hide();

        var children = mentoring.children;
        for (var i = 0; i < children.length; i++) {
            callIfExists(children[i], 'clearResult');
        }
    }

    function onChange() {
        clearResults();
        validateXBlock();
    }

    function initXBlockView() {
        messagesDOM = $(element).find('.messages');
        submitDOM = $(element).find('.submit .input-main');
        submitDOM.bind('click', submit);
        submitDOM.show();
        // Not used in standard mode.
        $(element).find('.review-link').hide()

        var options = {
            onChange: onChange
        };

        mentoring.displayChildren(options);

        mentoring.renderAttempts();
        mentoring.renderDependency();

        validateXBlock();
    }

    function handleRefreshResults(results) {
        $(element).html(results.html);
        mentoring.readChildren();
        initXBlockView();
    }

    function refreshXBlock() {
        var handlerUrl = runtime.handlerUrl(element, 'view');
        $.post(handlerUrl, '{}').success(handleRefreshResults);
    }

    // validate all children
    function validateXBlock() {
        var is_valid = true;
        var data = $('.attempts', element).data();
        var children = mentoring.children;

        if ((data.max_attempts > 0) && (data.num_attempts >= data.max_attempts)) {
            is_valid = false;
        }
        else {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child && child.name !== undefined) {
                    var child_validation = callIfExists(child, 'validate');
                    if (_.isBoolean(child_validation)) {
                        is_valid = is_valid && child_validation;
                    }
                }
            }
        }

        if (!is_valid) {
            submitDOM.attr('disabled','disabled');
        }
        else {
            submitDOM.removeAttr("disabled");
        }
    }

    // We need to manually refresh, XBlocks are currently loaded together with the section
    refreshXBlock(element);
}
