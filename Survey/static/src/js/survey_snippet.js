odoo.define('Survey.survey_snippet', function (require) {
    'use strict';

    const publicWidget = require('web.public.widget');
    const ajax = require('web.ajax');

    publicWidget.registry.SurveySnippet = publicWidget.Widget.extend({
        selector: '.s_survey_snippet',

        start: async function () {
            this.container = this.el.querySelector('.survey-content');
            if (!this.container) {
                console.error('Container with class ".survey-content" not found');
                return;
            }
            this.currentIndex = 0;
            this.answers = {};

            this.data = await ajax.jsonRpc('/survey_snippet/data', 'call', {});

            if (!this.data || this.data.length === 0) {
                this.container.innerHTML = "<p>No questions found.</p>";
                return;
            }

            this.renderQuestion();
        },

        renderQuestion: function () {
            const question = this.data[this.currentIndex];
            this.container.innerHTML = '';

            // Question heading
            const questionTitle = document.createElement('h4');
            questionTitle.textContent = `${this.currentIndex + 1}. ${question.text}`;
            this.container.appendChild(questionTitle);

            // Options container
            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('options');

            question.answers.forEach((answer, idx) => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.margin = '8px 0';

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'answer';
                radio.value = answer.text;
                radio.id = `q${this.currentIndex}_a${idx}`;

                // Restore previously selected answer if any
                if (this.answers[this.currentIndex] === answer.text) {
                    radio.checked = true;
                }

                label.appendChild(radio);
                label.appendChild(document.createTextNode(' ' + answer.text));

                optionsDiv.appendChild(label);
            });
            this.container.appendChild(optionsDiv);

            // Next or Submit button
            const btn = document.createElement('button');
            btn.textContent = this.currentIndex === this.data.length - 1 ? 'Submit' : 'Next';
            btn.style.display = 'block';
            btn.style.margin = '20px auto';
            btn.style.padding = '10px 20px';
            btn.style.backgroundColor = '#007bff';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '5px';
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', () => this.nextQuestion());
            this.container.appendChild(btn);
        },

        nextQuestion: function () {
            const selectedOption = this.container.querySelector('input[name="answer"]:checked');
            if (!selectedOption) {
                alert('Please select an option before continuing.');
                return;
            }
            this.answers[this.currentIndex] = selectedOption.value;

            if (this.currentIndex < this.data.length - 1) {
                this.currentIndex++;
                this.renderQuestion();
            } else {
                this.submitSurvey();
            }
        },

        submitSurvey: function () {
            // For now just thank the user, you can add ajax call here to save answers
            this.container.innerHTML = '<h3>Thank you for your response!</h3>';
            console.log('Submitted answers:', this.answers);
        },
    });
});
