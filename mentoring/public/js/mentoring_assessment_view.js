function MentoringAssessmentView(runtime, element, mentoring) {
    var gradeTemplate = _.template($('#xblock-grade-template').html());
    var reviewQuestionsTemplate = _.template($('#xblock-review-questions-template').html());
    var submitDOM, nextDOM, reviewDOM, tryAgainDOM, messagesDOM, reviewLinkDOM;
    var submitXHR;
    var checkmark;
    var active_child;

    var callIfExists = mentoring.callIfExists;

    function cleanAll() {
        // clean checkmark state
        checkmark.removeClass('checkmark-correct icon-ok fa-check');
        checkmark.removeClass('checkmark-partially-correct icon-ok fa-check');
        checkmark.removeClass('checkmark-incorrect icon-exclamation fa-exclamation');

        /* hide all children */
        $(':nth-child(2)', mentoring.children_dom).remove();

        $('.grade').html('');
        $('.attempts').html('');

        messagesDOM.empty().hide();
    }

    function no_more_attempts() {
        var attempts_data = $('.attempts', element).data();
        return attempts_data.num_attempts >= attempts_data.max_attempts;
    }

    function renderGrade() {
        var data = $('.grade', element).data();
        data.enable_extended = (no_more_attempts() && data.extended_feedback);
        _.extend(data, {
            'enable_extended': (no_more_attempts() && data.extended_feedback),
            'runDetails': function(label) {
                if (! this.enable_extended) {
                    return '.'
                }
                var self = this;
                return reviewQuestionsTemplate({'questions': self[label], 'label': label})
            }
        });
        cleanAll();
        $('.grade', element).html(gradeTemplate(data));
        reviewDOM.hide();
        reviewLinkDOM.hide();
        submitDOM.hide();
        nextDOM.hide();
        tryAgainDOM.show();

        if (no_more_attempts()) {
            tryAgainDOM.attr("disabled", "disabled");
        }
        else {
            tryAgainDOM.removeAttr("disabled");
        }

        mentoring.renderAttempts();

        if (data.assessment_message && ! no_more_attempts()) {
            mentoring.setContent(messagesDOM, data.assessment_message);
            messagesDOM.show();
        }
        $('a.question-link', element).click(jumpToName);
    }

    function handleTryAgain(result) {
        if (result.result !== 'success')
            return;

        active_child = -1;
        displayNextChild();
        tryAgainDOM.hide();
        submitDOM.show();
        if (! isLastChild()) {
            nextDOM.show();
        }
    }

    function tryAgain() {
        var handlerUrl = runtime.handlerUrl(element, 'try_again');
        if (submitXHR) {
            submitXHR.abort();
        }
        submitXHR = $.post(handlerUrl, JSON.stringify({})).success(handleTryAgain);
    }

    function initXBlockView() {
        submitDOM = $(element).find('.submit .input-main');
        nextDOM = $(element).find('.submit .input-next');
        reviewDOM = $(element).find('.submit .input-review');
        reviewLinkDOM = $(element).find('.review-link')
        tryAgainDOM = $(element).find('.submit .input-try-again');
        checkmark = $('.assessment-checkmark', element);
        messagesDOM = $('.assessment-messages', element);

        reviewLinkDOM.hide();
        submitDOM.show();
        submitDOM.bind('click', submit);
        nextDOM.bind('click', displayNextChild);
        nextDOM.show();
        function renderGradeEvent(event) {
            event.preventDefault();
            renderGrade();
        }
        reviewLinkDOM.bind('click', renderGradeEvent)
        reviewDOM.bind('click', renderGradeEvent);
        tryAgainDOM.bind('click', tryAgain);

        active_child = mentoring.step-1;
        mentoring.readChildren();
        displayNextChild();

        mentoring.renderDependency();
    }

    function isLastChild() {
        return (active_child == mentoring.children.length-1);
    }

    function isDone() {
        return (active_child == mentoring.children.length);
    }

    function getByName(name) {
        return $(element).find('div[name="' + name + '"]');
    }

    function jumpToName (event) {
        // Used only during extended feedback. Assumes completion and attempts exhausted.
        event.preventDefault();
        var options = {
            onChange: onChange
        };

        var target = getByName($(event.target).data('name'));
        active_child = $.inArray(target[0], mentoring.children_dom);
        cleanAll();
        mentoring.displayChild(active_child, options);
        mentoring.publish_event({
            event_type: 'xblock.mentoring.assessment.review',
            exercise_id: $(target).attr('name')
        });
        post_display(true);
        get_results();
    }

    function displayNextChild() {
        var options = {
            onChange: onChange
        };

        cleanAll();

        // find the next real child block to display. HTMLBlock are always displayed
        ++active_child;
        while (1) {
            var child = mentoring.displayChild(active_child, options);
            mentoring.publish_event({
                event_type: 'xblock.mentoring.assessment.shown',
                exercise_id: $(child).attr('name')
            });
            if ((typeof child !== 'undefined') || active_child >= mentoring.children.length-1)
                break;
            ++active_child;
        }
        if (isDone()) {
            renderGrade();
        } else {
            post_display();
        }
    }

    function post_display(show_link) {
        nextDOM.attr('disabled', 'disabled');
        if (no_more_attempts()) {
            if (show_link) {
                reviewLinkDOM.show();
            } else {
                reviewDOM.show();
                reviewDOM.removeAttr('disabled')
            }
        } else {
            reviewDOM.attr('disabled', 'disabled');
        }
        validateXBlock(show_link);
    }

    function onChange() {
        // Assessment mode does not allow to modify answers.
        // Once an answer has been submitted (next button is enabled),
        // start ignoring changes to the answer.
        if (nextDOM.attr('disabled')) {
            validateXBlock();
        }
    }

    function handleResults(response) {
        $('.grade', element).data('score', response.score);
        $('.grade', element).data('correct_answer', response.correct_answer);
        $('.grade', element).data('incorrect_answer', response.incorrect_answer);
        $('.grade', element).data('partially_correct_answer', response.partially_correct_answer);
        $('.grade', element).data('max_attempts', response.max_attempts);
        $('.grade', element).data('num_attempts', response.num_attempts);
        $('.grade', element).data('assessment_message', response.assessment_message);
        $('.attempts', element).data('max_attempts', response.max_attempts);
        $('.attempts', element).data('num_attempts', response.num_attempts);

        if (response.completed === 'partial') {
            checkmark.addClass('checkmark-partially-correct icon-ok fa-check');
        } else if (response.completed === 'correct') {
            checkmark.addClass('checkmark-correct icon-ok fa-check');
        } else {
            checkmark.addClass('checkmark-incorrect icon-exclamation fa-exclamation');
        }

        submitDOM.attr('disabled', 'disabled');

        /* We're not dealing with the current step */
        if (response.step != active_child+1) {
            return
        }
        nextDOM.removeAttr("disabled");
        reviewDOM.removeAttr("disabled");
    }

    function handleReviewResults(response) {
        handleResults(response);
        var options = {
            max_attempts: response.max_attempts,
            num_attempts: response.num_attempts
        };
        var result = response.results[1];
        var child = mentoring.children[active_child];
        callIfExists(child, 'handleSubmit', result, options);
        callIfExists(child, 'handleReview', result, options);
    }

    function handleSubmitResults(response){
        handleResults(response);
        // Update grade information
        $('.grade').data(response);
    }

    function calculate_results(handler_name, callback) {
        var data = {};
        var child = mentoring.children[active_child];
        if (child && child.name !== undefined) {
            data[child.name] = callIfExists(child, handler_name);
        }
        var handlerUrl = runtime.handlerUrl(element, handler_name);
        if (submitXHR) {
            submitXHR.abort();
        }
        submitXHR = $.post(handlerUrl, JSON.stringify(data)).success(callback);
    }

    function submit() {
        calculate_results('submit', handleSubmitResults)
    }

    function get_results() {
        calculate_results('get_results', handleReviewResults)
    }

    function validateXBlock(hide_nav) {
        var is_valid = true;

        var child = mentoring.children[active_child];
        if (child && child.name !== undefined) {
            var child_validation = callIfExists(child, 'validate');
            if (_.isBoolean(child_validation)) {
                is_valid = is_valid && child_validation;
            }
        }


        if (!is_valid) {
            submitDOM.attr('disabled','disabled');
        }
        else {
            submitDOM.removeAttr("disabled");
        }

        if (isLastChild() && ! hide_nav) {
            nextDOM.hide();
            reviewDOM.show();
        }

    }

    initXBlockView();

}
