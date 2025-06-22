from odoo import http
from odoo.http import request

class SurveySnippetController(http.Controller):

    @http.route('/survey_snippet/data', type='json', auth='public')
    def fetch_survey_data(self):
        survey = request.env['survey.survey'].sudo().browse(9)  # or dynamic survey ID
        questions_data = []

        for question in survey.question_ids:
            answers = [{'id': ans.id, 'text': ans.value} for ans in question.suggested_answer_ids]
            questions_data.append({
                'id': question.id,
                'text': question.title,  # ← THIS is the fix
                'answers': answers
            })

        return questions_data
