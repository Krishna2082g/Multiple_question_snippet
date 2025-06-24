odoo.define('Survey.survey_snippet_option', function (require) {
    'use strict';

    const options = require('web_editor.snippets.options');
    const ajax = require('web.ajax');

    options.registry.survey_snippet_option = options.Class.extend({

        start: async function () {
            const result = await this._super.apply(this, arguments);
            await this._populateSurveyOptions();
            return result;
        },

        onBuilt: function () {
            this._super.apply(this, arguments);
            this._populateSurveyOptions();
        },

        async _populateSurveyOptions() {
            try {
                const surveys = await ajax.jsonRpc('/survey_snippet/list', 'call', {});
                console.log('Editor: fetched surveys for dropdown', surveys);

                const weSelectEl = this.el.querySelector('we-select[data-attribute="data-sel-survey-id"]');

                if (!weSelectEl || typeof weSelectEl.setOptions !== 'function') {
                    console.warn('we-select not found or missing setOptions method');
                    return;
                }

                const options = surveys.map(s => ({
                    label: s.title || `Survey ${s.id}`,
                    value: String(s.id),
                }));

                // Add default option
                options.unshift({
                    label: 'Select a survey',
                    value: '',
                });

                weSelectEl.setOptions(options);

            } catch (error) {
                console.error('Failed to populate survey options:', error);
            }
        },

        async changeOption(previewMode, value, $opt) {
            this.$target.attr('data-sel-survey-id', value);
            console.log('Survey selected:', value);
        }
    });

    return options.registry.survey_snippet_option;
});
