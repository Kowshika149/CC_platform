import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { HorizontalProjectStepper } from '../../components/HorizontalProjectStepper';
import { EscrowBanner } from '../../components/EscrowBanner';
import { StarRating, StarDisplay } from '../../components/StarRating';
import { getProjectPricing } from '../../utils/projectPricing';
import { getEscrowSummary } from '../../utils/escrow';
import { canDownloadFinalFiles } from '../../utils/projectDelivery';
import { getFileExtension, triggerDemoDownload } from '../../utils/demoFiles';
import { SERVICE_LABELS } from '../../types';
import { Download, CheckCircle, Clock } from 'lucide-react';

export default function CustomerDeliveryPage() {
  const { id } = useParams();
  const { getProject, submitProjectReview } = useApp();

  const project = getProject(id || '');
  const [overallRating, setOverallRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(4);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!project) return <div className="text-center py-12">Project not found</div>;

  if (!canDownloadFinalFiles(project)) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
        <Clock className="h-14 w-14 text-surface-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Files Not Ready Yet</h1>
        <p className="text-surface-500 mb-6">
          Final deliverables will appear here after your creator uploads and completes the delivery.
        </p>
        <Link to={`/customer/projects/${project.id}/workspace`} className="btn-primary">
          Back to Workspace
        </Link>
      </div>
    );
  }

  const pricing = getProjectPricing(project);
  const escrow = getEscrowSummary(
    pricing,
    project.status === 'final_delivered' ? 'completed' : project.status,
  );

  const finalFiles = project.drafts.filter((d) => d.isFinal);

  const serviceTags = project.requirement.items
    .map((item) => SERVICE_LABELS[item.serviceId])
    .filter(Boolean)
    .slice(0, 2);
  const tags = serviceTags.length > 0
    ? serviceTags
    : [project.requirement.subcategoryName || project.requirement.categoryName];

  const handleDownloadAll = () => {
    finalFiles.forEach((file) => triggerDemoDownload(file.name));
  };

  const handleSubmitReview = () => {
    if (!comment.trim()) return;
    submitProjectReview(project.id, {
      overallRating,
      qualityRating,
      communicationRating,
      timelinessRating,
      comment: comment.trim(),
    });
    setSubmitted(true);
  };

  const hasReview = !!project.review || submitted;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <EscrowBanner escrow={escrow} tags={tags} variant="dark" />
      <HorizontalProjectStepper status={project.status === 'final_delivered' || project.review ? 'completed' : project.status} />

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">Your final content is ready</h1>
        <p className="text-surface-500 mt-2">
          High-resolution, watermark-free, downloadable now that payment is released.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {finalFiles.map((file) => (
          <div key={file.id} className="rounded-2xl border border-surface-200 bg-white p-4 shadow-card flex flex-col">
            <div className="rounded-xl bg-surface-100 aspect-[4/3] flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-surface-400 tracking-wide">
                {getFileExtension(file.name)}
              </span>
            </div>
            <p className="font-semibold text-sm text-surface-900 truncate">{file.name}</p>
            <p className="text-xs text-surface-500 mt-0.5 mb-4">{file.size || '—'}</p>
            <button
              type="button"
              onClick={() => triggerDemoDownload(file.name)}
              className="mt-auto w-full py-2.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              DOWNLOAD
            </button>
          </div>
        ))}
      </div>

      <div className="text-center mb-10">
        <button
          type="button"
          onClick={handleDownloadAll}
          className="inline-flex items-center justify-center px-10 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold tracking-wide transition"
        >
          DOWNLOAD ALL
        </button>
      </div>

      <div className="card-elevated max-w-2xl mx-auto">
        {hasReview ? (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Thank you for your review!</h2>
            <StarDisplay value={project.review?.overallRating || overallRating} />
            {(project.review?.comment || comment) && (
              <p className="text-sm text-surface-600 mt-4 italic">
                &ldquo;{project.review?.comment || comment}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center mb-2">How was your experience?</h2>
            <div className="flex justify-center mb-6">
              <StarRating label="" value={overallRating} onChange={setOverallRating} />
            </div>
            <div className="space-y-4 mb-6">
              <StarRating label="Quality" value={qualityRating} onChange={setQualityRating} />
              <StarRating label="Communication" value={communicationRating} onChange={setCommunicationRating} />
              <StarRating label="Timeliness" value={timelinessRating} onChange={setTimelinessRating} />
            </div>
            <div className="mb-6">
              <label className="text-xs font-bold tracking-wide text-surface-500 uppercase">Text Review</label>
              <textarea
                className="input min-h-[120px] mt-2"
                placeholder="Share your experience working with this creator..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={!comment.trim()}
              className="btn-primary w-full py-3.5 font-bold tracking-wide"
            >
              SUBMIT REVIEW
            </button>
          </>
        )}
      </div>

      <div className="text-center mt-6">
        <Link to={`/customer/projects/${project.id}`} className="text-sm text-brand-600 hover:underline">
          Back to project details
        </Link>
      </div>
    </div>
  );
}
