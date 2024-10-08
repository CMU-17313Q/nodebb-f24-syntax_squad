'use strict';

define('forum/topic/best-response', [
    'postSelect', 'alerts', 'api',
], function (postSelect, alerts, api) {
    const BestResponse = {};
    let modal;
    let markBtn;
    let purgeBtn;
    let tid;

    BestResponse.init = function () {
        tid = ajaxify.data.tid;

        $(window).off('action:ajaxify.end', onAjaxifyEnd).on('action:ajaxify.end', onAjaxifyEnd);

        if (modal) {
            return;
        }
        app.parseAndTranslate('modals/best-response', {}, function (html) {
            modal = html;

            $('body').append(modal);

            markBtn = modal.find('#markResponse_posts_confirm');
            purgeBtn = modal.find('#purge_posts_confirm');

            modal.find('#markResponse_posts_cancel').on('click', closeModal);

            postSelect.init(function () {
                checkButtonEnable();
                showPostsSelected();
            });
            showPostsSelected();

            markBtn.on('click', function () {
                if (postSelect.pids.length === 1) {
                    markBestResponse(markBtn, pid => `/posts/${pid}/best`);
                }
            });

        });
    };

    function onAjaxifyEnd() {
        if (ajaxify.data.template.name !== 'topic' || ajaxify.data.tid !== tid) {
            closeModal();
            $(window).off('action:ajaxify.end', onAjaxifyEnd);
        }
    }

	// Function to mark a post as the best response
	function markBestResponse(btn, route) {
		btn.attr('disabled', true);
		const postId = postSelect.pids[0]; // Get the selected post ID
		
		// Call the API to mark the post as the best using PUT
		api.put(route(postId), { postId: postId }) // Send the selected post ID to the server
			.then((response) => {
				alerts.success('Post marked as best response!');
				closeModal();
			})
			.catch((error) => {
				console.error('Error marking post as best response:', error);
				alerts.error('Failed to mark post as best response.');
			})
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
        if (postSelect.pids.length === 1) {
            markBtn.removeAttr('disabled');
            purgeBtn.removeAttr('disabled');
        } else {
            markBtn.attr('disabled', true);
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

    return BestResponse;
});
