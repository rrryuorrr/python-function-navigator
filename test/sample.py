def main():
    def nested_helper():
        return "nested"

    return nested_helper()


class ReportParser:
    def __init__(self):
        self.rows = []

    def parse(self):
        return self.rows

    async def export_csv(self):
        return "report.csv"


async def load_data():
    return []
