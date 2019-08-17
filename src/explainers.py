import re


class Video(dict):
    def __init__(self, url, start, end):
        self.url = url
        self.start = start
        self.end = end
        dict.__init__(self, url=url, start=start, end=end)


class Answer(dict):
    def __init__(self, videos):
        self.videos = videos
        dict.__init__(self, videos=videos)

    @classmethod
    def from_txt(cls, txt):
        tokens = txt.split()
        videos = []
        url = tokens[0]
        pat = re.compile(r'\[([\d:]+)-([\d:]+)\]')
        for tspec in tokens[1:]:
            (start, end) = pat.match(tspec).groups()
            videos.append(Video(url, start, end))
        return cls(videos)


def parse_explainers():
    with open('data/explainers.txt', 'r') as f:
        lines = f.readlines()

    explainers = []
    question = answer = None
    for line in lines:
        if line.startswith('#'):
            continue
        if all((line == '\n',
                question is not None,
                answer is not None)):
            explainers.append({
                'question': question,
                'answer': answer,
            })
            question = answer = None
            continue
        if line.startswith('Question:'):
            question = line.split(': ')[1].strip()
            continue
        if line.startswith('Answer:'):
            answer = Answer.from_txt(line.split(': ')[1])
            continue

    # there might not be a newline at the end of the file, in which case we
    # have one more record to flush out.
    if question is not None:
        explainers.append({
            'question': question,
            'answer': answer,
        })

    return explainers


if __name__ == '__main__':
    import json
    print('Have the following explainers')
    print(json.dumps(parse_explainers()))
