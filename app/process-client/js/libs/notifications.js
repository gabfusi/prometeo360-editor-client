define(['pnotify'], function(PNotify) {
    "use strict";

    require(['pnotify.confirm']);
    require(['pnotify.buttons']);
    require(['pnotify.callbacks']);

    PNotify.prototype.options.styling = "bootstrap3";

    function notify(type, title, text, duration) {

        if(title && !text) {
            text = title;
            title = false;
        }

        duration = typeof duration !== 'undefined' ? duration : 5000;

        new PNotify({
            title: title || '',
            text: text || '',
            type: type,
            icon: false,
            width: 360,
            cornerclass: 'ui-pnotify-sharp',
            delay: duration,
            buttons: {
                closer: true,
                sticker: false,
                classes: {
                    closer:  'fi-x'
                }
            }
        });
    }

    function dialog(title, content) {

        new PNotify({
            title: title || '',
            text: content || '',
            icon: false,
            hide: false,
            width: 560,
            delay: 60000,
            cornerclass: 'ui-pnotify-sharp',
            buttons: {
                closer: true,
                sticker: false,
                classes: {
                    closer:  'fi-x'
                }
            },
            confirm:{
                confirm: true,
                buttons: []
            },
            addclass: 'stack-modal',
            stack: {'dir1': 'down', 'dir2': 'right', 'modal': true}
        });
    }

    function confirm(title, question, onConfirm) {

        new PNotify({
            title: title,
            text: question,
            icon: false,
            hide: false,
            width: 560,
            confirm: {
                confirm: true,
                buttons: [{
                    text: "Ok",
                    addClass: "btn-primary",
                    promptTrigger: true,
                    click: function(notice, value){
                        notice.remove();
                        $('.ui-pnotify-modal-overlay').remove();
                        notice.get().trigger("pnotify.confirm", [notice, value]);
                        if(onConfirm) onConfirm();
                        console.log(notice);
                    }
                },{
                    text: "Annulla",
                    addClass: "",
                    click: function(notice){
                        notice.remove();
                        $('.ui-pnotify-modal-overlay').remove();
                        notice.get().trigger("pnotify.cancel", notice);
                    }
                }]
            },
            buttons: {
                closer: false,
                sticker: false
            },
            addclass: 'stack-modal',
            stack: {'dir1': 'down', 'dir2': 'right', 'modal': true}

        });
    }

    function prompt(title, text, onConfirm, onCancel) {

        new PNotify({
            title: title,
            text: text,
            icon: false,
            hide: false,
            width: 560,
            confirm: {
                prompt: true,
                buttons: [{
                    text: "Ok",
                    addClass: "btn-primary",
                    promptTrigger: true,
                    click: function(notice, value){
                        notice.remove();
                        $('.ui-pnotify-modal-overlay').remove();
                        notice.get().trigger("pnotify.confirm", [notice, value]);
                        if(onConfirm) onConfirm(value);
                    }
                },{
                    text: "Annulla",
                    addClass: "",
                    click: function(notice){
                        notice.remove();
                        $('.ui-pnotify-modal-overlay').remove();
                        notice.get().trigger("pnotify.cancel", notice);
                        if(onCancel) onCancel();
                    }
                }]
            },
            history: {
                history: false
            },
            addclass: 'stack-modal',
            stack: {'dir1': 'down', 'dir2': 'right', 'modal': true}
        })

    }

    return {

        dialog: function(title, content) {
            dialog(title, content);
        },

        popup: function(title, text) {
            notify('notice', title, text, 60000);
        },

        notice: function(title, text) {
            notify('notice', title, text);
        },

        info: function(title, text) {
            notify('info', title, text);
        },

        success: function(title, text) {
            notify('success', title, text);
        },

        error: function(title, text) {
            notify('error', title, text);
        },

        confirm: function(title, text, onConfirm) {
            confirm(title, text, onConfirm);
        },

        prompt: function(title, text, onConfirm, onCancel) {
            prompt(title, text, onConfirm, onCancel);
        }

    };

});