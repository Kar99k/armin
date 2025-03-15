import CommitLog from "./components/commit-log";
import TopContent from "./components/top-content";
import AskQuestionCard from "./components/ask-question-card";
const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <TopContent />

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
        </div>
      </div>

      <div className="mt-8"></div>

      <CommitLog />
    </div>
  );
};

export default DashboardPage;
