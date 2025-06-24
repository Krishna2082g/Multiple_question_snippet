from odoo import http
from odoo.http import request


class SurveySnippetController(http.Controller):

    # ✅ Full survey data for frontend rendering
    @http.route("/survey_snippet/data", type="json", auth="public")
    def get_surveys(self):
        surveys = request.env["survey.survey"].sudo().search([])
        data = []
        for survey in surveys:
            questions = []
            for question in survey.question_ids:
                questions.append({
                    "id": question.id,
                    "text": question.title,
                    "answers": [
                        {"id": a.id, "text": a.value}
                        for a in question.suggested_answer_ids
                    ],
                })
            data.append({
                "id": survey.id,
                "title": survey.title,
                "questions": questions,
            })
        return data

    # ✅ Lightweight survey list for editor dropdown
    @http.route("/survey_snippet/list", type="json", auth="public")
    def get_survey_titles(self):
        surveys = request.env["survey.survey"].sudo().search([])
        return [{"id": survey.id, "title": survey.title or f"Survey {survey.id}"} for survey in surveys]

    # ✅ Save answers from frontend
    @http.route("/survey_snippet/submit", type="json", auth="public", methods=["POST"])
    def submit_survey(self, survey_id=None, answers=None, **kwargs):
        if not survey_id or not answers:
            return {"error": "Missing survey_id or answers"}

        survey = request.env["survey.survey"].sudo().browse(int(survey_id))
        if not survey.exists():
            return {"error": "Invalid survey_id"}

        try:
            user_input = request.env["survey.user_input"].sudo().create({
                "survey_id": survey.id,
                "state": "done",
            })

            for question_index_str, suggested_answer_id in answers.items():
                question_index = int(question_index_str)
                if question_index >= len(survey.question_ids):
                    continue

                question = survey.question_ids[question_index]
                answer_id = int(suggested_answer_id)

                valid_answer = question.suggested_answer_ids.filtered(
                    lambda a: a.id == answer_id
                )
                if not valid_answer:
                    continue

                request.env["survey.user_input.line"].sudo().create({
                    "user_input_id": user_input.id,
                    "question_id": question.id,
                    "suggested_answer_id": valid_answer.id,
                    "answer_type": "char_box",
                    "value_char_box": valid_answer.value,
                })

            return {"success": True, "response_id": user_input.id}

        except Exception as e:
            return {"error": f"Failed to save response: {str(e)}"}
