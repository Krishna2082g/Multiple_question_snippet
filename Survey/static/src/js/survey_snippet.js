odoo.define('Survey.survey_snippet', function (require) {
    'use strict';

    const publicWidget = require('web.public.widget');
    const ajax = require('web.ajax');

    publicWidget.registry.SurveySnippet = publicWidget.Widget.extend({
        selector: '.s_survey_snippet',

        start: async function () {
            this.container = this.el.querySelector('.survey-content');
            if (!this.container) return;

            this.currentIndex = 0;
            this.answers = {};
            this.selectedSurvey = null;

            const allSurveys = await ajax.jsonRpc('/survey_snippet/data', 'call', {});
            if (!Array.isArray(allSurveys) || allSurveys.length === 0) {
                this.container.innerHTML = "<p>No surveys available.</p>";
                return;
            }

            this.renderSurveySelector(allSurveys);
        },

        renderSurveySelector: function (surveys) {
            this.container.innerHTML = `
                <h3 class="text-center mb-3">Choose a Survey</h3>
            `;

            const select = document.createElement('select');
            select.className = 'form-control mb-3';
            select.innerHTML = `<option disabled selected>-- Select Survey --</option>`;
            surveys.forEach(s => {
                const option = document.createElement('option');
                option.value = s.id;
                option.textContent = s.title;
                select.appendChild(option);
            });

            const button = document.createElement('button');
            button.textContent = 'Start Survey';
            button.className = 'btn btn-success d-block mx-auto';

            button.addEventListener('click', () => {
                const selectedId = parseInt(select.value);
                const survey = surveys.find(s => s.id === selectedId);
                if (!survey) return alert('Select a valid survey');

                this.selectedSurvey = survey;
                this.data = survey.questions;
                this.currentIndex = 0;
                this.answers = {};
                this.renderQuestion();
            });

            this.container.appendChild(select);
            this.container.appendChild(button);
        },

        renderQuestion: function () {
            const question = this.data[this.currentIndex];
            this.container.innerHTML = `
                <h4 class="mb-3">${this.currentIndex + 1}. ${question.text}</h4>
            `;

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'mb-4';

            question.answers.forEach((answer, idx) => {
                const label = document.createElement('label');
                label.className = 'd-block mb-2';

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'answer';
                radio.value = answer.id;
                radio.className = 'me-2';

                if (this.answers[this.currentIndex] === answer.id) radio.checked = true;

                label.appendChild(radio);
                label.appendChild(document.createTextNode(answer.text));
                optionsDiv.appendChild(label);
            });

            this.container.appendChild(optionsDiv);

            const btn = document.createElement('button');
            btn.textContent = this.currentIndex === this.data.length - 1 ? 'Submit' : 'Next';
            btn.className = 'btn btn-primary d-block mx-auto';
            btn.addEventListener('click', () => this.nextQuestion());

            this.container.appendChild(btn);
        },

        nextQuestion: function () {
            const selected = this.container.querySelector('input[name="answer"]:checked');
            if (!selected) return alert('Please select an option.');
            this.answers[this.currentIndex] = parseInt(selected.value);

            if (this.currentIndex < this.data.length - 1) {
                this.currentIndex++;
                this.renderQuestion();
            } else {
                this.submitSurvey();
            }
        },

        submitSurvey: function () {
            this.container.innerHTML = '<h4 class="text-center">Submitting your response...</h4>';

            ajax.jsonRpc('/survey_snippet/submit', 'call', {
                survey_id: this.selectedSurvey.id,
                answers: this.answers
            }).then((result) => {
                if (result.success) {
                    this.container.innerHTML = `
                        <div class="text-center py-5">
                            <h3>Thank you for your response!</h3>
                        </div>
                    `;
                } else {
                    this.container.innerHTML = `<h4 class="text-danger">Error: ${result.error || 'Unknown error'}</h4>`;
                }
            }).catch(() => {
                this.container.innerHTML = '<h4 class="text-danger">Server error. Please try again later.</h4>';
            });
        },
    });
});
