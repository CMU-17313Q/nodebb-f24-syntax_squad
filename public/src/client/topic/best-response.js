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
		// Below is how this file links to the tpl file and how it represents it
		// modified file below to redirect to best-response.tpl
		app.parseAndTranslate('modals/best-response', {}, function (html) {
			modal = html;

			$('body').append(modal);

			// These are the buttons that are on the modal (other than close)
			markBtn = modal.find('#markResponse_posts_confirm');
			purgeBtn = modal.find('#purge_posts_confirm');

			modal.find('#markResponse_posts_cancel').on('click', closeModal);

			postSelect.init(function () {
				checkButtonEnable();
				showPostsSelected();
			});
			showPostsSelected();

			// Linking the buttons to the functionality
			markBtn.on('click', function () {
				console.log('Mark button clicked');
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

	// Edit this function to mark a post as the best response
	function markBestResponse(btn, route) {
        btn.attr('disabled', true);
        const postId = postSelect.pids[0]; // Get the selected post ID
        console.log('Marking post as best response:', postId);
        
        // Call the API to mark the post as the best
        api.post(route(postId), {})
            .then(() => {
                alerts.success('Post marked as best response!');
                closeModal();
                // Optionally, refresh the page or update the UI to reflect the change
            })
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
	// Made sure you can only mark one post at a time in the UI
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
