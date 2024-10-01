'use strict';

define('forum/topic/delete-posts', [
    'postSelect', 'alerts', 'api',
], function (postSelect, alerts, api) {
    const DeletePosts = {};
    let modal;
    let deleteBtn;
    let purgeBtn;
    let tid;

    DeletePosts.init = function () {
        tid = ajaxify.data.tid;

        $(window).off('action:ajaxify.end', onAjaxifyEnd).on('action:ajaxify.end', onAjaxifyEnd);

        if (modal) {
            return;
        }
        //Below is how this file links to the tpl file and how it represents it
        //modified file below to redirect to best-response.tpl
        app.parseAndTranslate('modals/best-response', {}, function (html) {
            modal = html;

            $('body').append(modal);

            //These are the buttons that are on the modal (other than close)
            deleteBtn = modal.find('#delete_posts_confirm');
            purgeBtn = modal.find('#purge_posts_confirm');

            modal.find('#delete_posts_cancel').on('click', closeModal);

            postSelect.init(function () {
                checkButtonEnable();
                showPostsSelected();
            });
            showPostsSelected();

            //Linking the buttons to the functionality
            deleteBtn.on('click', function () {
                deletePosts(deleteBtn, pid => `/posts/${pid}/state`);
            });
            //ignore the purge button from now
            purgeBtn.on('click', function () {
                deletePosts(purgeBtn, pid => `/posts/${pid}`);
            });
        });
    };

    function onAjaxifyEnd() {
        if (ajaxify.data.template.name !== 'topic' || ajaxify.data.tid !== tid) {
            closeModal();
            $(window).off('action:ajaxify.end', onAjaxifyEnd);
        }
    }

    //Edit this function to mark a post as the best response 
    function deletePosts(btn, route) {
        btn.attr('disabled', true);
        Promise.all(postSelect.pids.map(pid => api.del(route(pid), {})))
            .then(closeModal)
            .catch(alerts.error)
            .finally(() => {
                btn.removeAttr('disabled');
            });
    }

    function showPostsSelected() {
        if (postSelect.pids.length) {
            modal.find('#pids').translateHtml('[[topic:fork-pid-count, ' + postSelect.pids.length + ']]');
        } else {
            modal.find('#pids').translateHtml('[[topic:fork-no-pids]]');
        }
    }

    function checkButtonEnable() {
        if (postSelect.pids.length==1) {
            deleteBtn.removeAttr('disabled');
            purgeBtn.removeAttr('disabled');
        } else {
            deleteBtn.attr('disabled', true);
            purgeBtn.attr('disabled', true);
        }
    }

    function closeModal() {
        if (modal) {
            modal.remove();
            modal = null;
            postSelect.disable();
        }
    }

    return DeletePosts;
});
