import jsPDF from 'jspdf';
import { createSignatureDataUrl } from './signatureGenerator';

export interface CertificateData {
  candidateName: string;
  candidateEmail: string;
  quizTitle: string;
  categoryName: string;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSeconds: number;
  quizMode: 'Practice' | 'Exam';
  certificateId?: string;
  issueDate?: string;
}

export const getPerformanceGrade = (percentage: number): { grade: string; remark: string } => {
  if (percentage >= 90) return { grade: 'Distinction (A+)', remark: 'Demonstrated Outstanding Mastery & Excellence' };
  if (percentage >= 80) return { grade: 'First Division (A)', remark: 'Demonstrated Superior Subject Knowledge' };
  if (percentage >= 70) return { grade: 'Merit (B+)', remark: 'Demonstrated Highly Commendable Proficiency' };
  if (percentage >= 60) return { grade: 'Good Standing (B)', remark: 'Successfully Qualified with Good Competence' };
  if (percentage >= 50) return { grade: 'Satisfactory Pass (C)', remark: 'Successfully Met Core Examination Standards' };
  return { grade: 'Certificate of Participation', remark: 'Successfully Completed the Examination' };
};

export const formatDuration = (totalSecs: number): string => {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}m ${secs}s`;
};

export interface CertificateAssets {
  faLogoImg?: string | HTMLImageElement | null;
  pakFlagImg?: string | HTMLImageElement | null;
  nadeemSigImg?: string | HTMLImageElement | null;
  rehmanSigImg?: string | HTMLImageElement | null;
}

// Vector 5-Pointed Star Generator for jsPDF
export function drawVectorStar(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerR: number = 2.2,
  innerR: number = 0.9,
  fillColor: [number, number, number] = [217, 119, 6]
) {
  doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
  const points: [number, number][] = [];
  const spikes = 5;
  const step = Math.PI / spikes;
  let rot = (Math.PI / 2) * 3; // point straight up

  for (let i = 0; i < spikes; i++) {
    const x1 = cx + Math.cos(rot) * outerR;
    const y1 = cy + Math.sin(rot) * outerR;
    points.push([x1, y1]);
    rot += step;

    const x2 = cx + Math.cos(rot) * innerR;
    const y2 = cy + Math.sin(rot) * innerR;
    points.push([x2, y2]);
    rot += step;
  }

  for (let i = 0; i < points.length; i++) {
    const nextIdx = (i + 1) % points.length;
    doc.triangle(cx, cy, points[i][0], points[i][1], points[nextIdx][0], points[nextIdx][1], 'F');
  }
}

export const generateCertificatePdf = (data: CertificateData, assets?: CertificateAssets): jsPDF => {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const centerX = pageWidth / 2;

  const candidateName = data.candidateName.trim() || 'Candidate';
  const candidateEmail = data.candidateEmail.trim();
  const certId = data.certificateId || `FAP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = data.issueDate || new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const { grade, remark } = getPerformanceGrade(data.scorePercentage);

  // 1. Background Fill - Unique Royal Champagne Ivory Tone (#FAF5EA)
  doc.setFillColor(250, 245, 234);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Inner subtle illuminated parchment area
  doc.setFillColor(254, 252, 246);
  doc.roundedRect(6, 6, pageWidth - 12, pageHeight - 12, 4, 4, 'F');

  // Subtle security guilloché watermark circles & concentric arcs
  doc.setDrawColor(237, 228, 210);
  doc.setLineWidth(0.35);
  doc.circle(centerX, 105, 82, 'S');
  doc.circle(centerX, 105, 78, 'S');
  doc.circle(centerX, 105, 74, 'S');
  doc.circle(centerX, 105, 48, 'S');
  doc.circle(centerX, 105, 45, 'S');

  // Center watermark academic seal emblem (Very faint)
  doc.setFont('times', 'bold');
  doc.setFontSize(38);
  doc.setTextColor(240, 233, 218);
  doc.text('FA', centerX, 108, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FUTURE ACADEMY PRO - VERIFIED CREDENTIAL', centerX, 115, { align: 'center' });

  // 2. Multi-tier Royal Borders
  // 1st Outermost: Deep Royal Midnight Navy (#0A192F)
  doc.setDrawColor(10, 25, 47);
  doc.setLineWidth(2.4);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // 2nd Middle: Imperial Burnished Gold (#C59B27)
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.8);
  doc.rect(11.5, 11.5, pageWidth - 23, pageHeight - 23);

  // 3rd Inner: Deep Pakistani Emerald (#01411C)
  doc.setDrawColor(1, 65, 28);
  doc.setLineWidth(0.35);
  doc.rect(13.5, 13.5, pageWidth - 27, pageHeight - 27);

  // Four Elegant Corner Accents (Navy & Gold Ornaments)
  const drawCornerAccent = (x: number, y: number, dirX: number, dirY: number) => {
    // Gold outer corner
    doc.setFillColor(197, 155, 39);
    doc.triangle(
      x, y,
      x + dirX * 12, y,
      x, y + dirY * 12,
      'F'
    );
    // Navy inner corner
    doc.setFillColor(10, 25, 47);
    doc.triangle(
      x + dirX * 1.5, y + dirY * 1.5,
      x + dirX * 8, y + dirY * 1.5,
      x + dirX * 1.5, y + dirY * 8,
      'F'
    );
    // Little Gold diamond pin
    doc.setFillColor(245, 158, 11);
    doc.circle(x + dirX * 3.5, y + dirY * 3.5, 0.7, 'F');
  };

  drawCornerAccent(14, 14, 1, 1);
  drawCornerAccent(pageWidth - 14, 14, -1, 1);
  drawCornerAccent(14, pageHeight - 14, 1, -1);
  drawCornerAccent(pageWidth - 14, pageHeight - 14, -1, -1);

  // 3. Header: Left Academy Logo, Center Authority Info, Right Pakistan Flag
  const headerCenterY = 27;

  // --- A. LEFT SIDE: Future Academy Pro Official Crest Logo (Circular) ---
  const leftLogoCenterX = 35;
  const logoRadius = 12;
  const logoDiameter = logoRadius * 2;

  if (assets?.faLogoImg) {
    try {
      const isPng = typeof assets.faLogoImg === 'string' && assets.faLogoImg.startsWith('data:image/png');
      doc.addImage(
        assets.faLogoImg,
        isPng ? 'PNG' : 'JPEG',
        leftLogoCenterX - logoRadius,
        headerCenterY - logoRadius,
        logoDiameter,
        logoDiameter
      );
    } catch {
      drawVectorFaLogo(doc, leftLogoCenterX, headerCenterY, logoRadius);
    }
  } else {
    drawVectorFaLogo(doc, leftLogoCenterX, headerCenterY, logoRadius);
  }

  // Circular Gold Ring Frame around Left Logo
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1.0);
  doc.circle(leftLogoCenterX, headerCenterY, logoRadius + 0.5, 'S');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.35);
  doc.circle(leftLogoCenterX, headerCenterY, logoRadius + 1.1, 'S');

  // Left Logo Caption
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(10, 25, 47);
  doc.text('ACADEMY CREST', leftLogoCenterX, headerCenterY + logoRadius + 4, { align: 'center' });

  // --- B. RIGHT SIDE: Circular Pakistan Flag Logo ---
  const rightFlagCenterX = pageWidth - 35;

  if (assets?.pakFlagImg) {
    try {
      doc.addImage(assets.pakFlagImg, 'PNG', rightFlagCenterX - logoRadius, headerCenterY - logoRadius, logoDiameter, logoDiameter);
    } catch {
      drawVectorPakistanFlag(doc, rightFlagCenterX, headerCenterY, logoRadius);
    }
  } else {
    drawVectorPakistanFlag(doc, rightFlagCenterX, headerCenterY, logoRadius);
  }

  // Circular Gold Ring Frame around Right Flag
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1.0);
  doc.circle(rightFlagCenterX, headerCenterY, logoRadius + 0.5, 'S');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.35);
  doc.circle(rightFlagCenterX, headerCenterY, logoRadius + 1.1, 'S');

  // Right Flag Caption
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(1, 65, 28);
  doc.text('ISLAMIC REPUBLIC OF PAKISTAN', rightFlagCenterX, headerCenterY + logoRadius + 4, { align: 'center' });

  // --- C. CENTER: Title & Accreditation Authority ---
  // Five Golden Vector Stars above FUTURE ACADEMY PRO (No text character conversion bugs!)
  const starY = headerCenterY - 8.5;
  const starOffsets = [-16, -8, 0, 8, 16];
  starOffsets.forEach((offsetX, idx) => {
    const isCenter = idx === 2;
    drawVectorStar(
      doc,
      centerX + offsetX,
      starY,
      isCenter ? 2.6 : 2.1,
      isCenter ? 1.05 : 0.85,
      [217, 119, 6] // Rich gold
    );
  });

  // Brand Title: FUTURE ACADEMY PRO
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(10, 25, 47); // Deep Royal Midnight Navy
  doc.text('FUTURE ACADEMY PRO', centerX, headerCenterY + 1, { align: 'center' });

  // Authority Accreditation Line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9); // Burnished Gold
  doc.text('NATIONAL DIGITAL EXAMINATION & ACADEMIC CERTIFICATION AUTHORITY', centerX, headerCenterY + 6.5, { align: 'center' });

  // Ornamental Golden Divider with center diamond
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.line(centerX - 55, headerCenterY + 9.5, centerX + 55, headerCenterY + 9.5);
  doc.setDrawColor(1, 65, 28);
  doc.setLineWidth(0.2);
  doc.line(centerX - 40, headerCenterY + 11, centerX + 40, headerCenterY + 11);
  // Center diamond on divider
  doc.setFillColor(217, 119, 6);
  doc.triangle(centerX - 2, headerCenterY + 9.5, centerX, headerCenterY + 7.8, centerX + 2, headerCenterY + 9.5, 'F');
  doc.triangle(centerX - 2, headerCenterY + 9.5, centerX, headerCenterY + 11.2, centerX + 2, headerCenterY + 9.5, 'F');

  // 4. Certificate Primary Heading
  const bodyY = headerCenterY + 14;
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(10, 25, 47); // Deep Navy
  doc.text('CERTIFICATE OF ACHIEVEMENT', centerX, bodyY + 10, { align: 'center' });

  // Sub-heading
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('THIS OFFICIAL CREDENTIAL IS PROUDLY CONFERRED UPON', centerX, bodyY + 16.5, { align: 'center' });

  // 5. Candidate Name
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(4, 120, 87); // Rich Emerald
  doc.text(candidateName, centerX, bodyY + 28.5, { align: 'center' });

  // Candidate Name Underline with Gold Diamond
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.7);
  doc.line(centerX - 45, bodyY + 31.5, centerX + 45, bodyY + 31.5);
  doc.setFillColor(217, 119, 6);
  doc.circle(centerX, bodyY + 31.5, 1.2, 'F');

  // Candidate Email & Registration
  if (candidateEmail) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Candidate Email: ${candidateEmail}  •  Status: Verified Candidate`, centerX, bodyY + 36.5, { align: 'center' });
  }

  // 6. Test Qualification Citation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `For successfully qualifying the comprehensive examination in`,
    centerX,
    bodyY + 44,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(10, 25, 47);
  doc.text(
    `${data.quizTitle} (${data.categoryName})`,
    centerX,
    bodyY + 50,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(remark, centerX, bodyY + 55, { align: 'center' });

  // 7. Verified Performance Badge (Rectangular Pill Box in Warm Amber/Champagne)
  const statsBoxY = bodyY + 59.5;
  doc.setFillColor(254, 249, 235); // Light warm champagne #fef9eb
  doc.setDrawColor(245, 158, 11); // Gold border #f59e0b
  doc.setLineWidth(0.4);
  doc.roundedRect(centerX - 82, statsBoxY, 164, 13, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(4, 120, 87);
  doc.text(
    `Score: ${data.scorePercentage}%   |   Correct: ${data.correctAnswers}/${data.totalQuestions}   |   Grade: ${grade}   |   Time: ${formatDuration(data.timeSeconds)}`,
    centerX,
    statsBoxY + 8.5,
    { align: 'center' }
  );

  // 8. Official Gold Security Seal (Left side)
  const sealX = 40;
  const sealY = 157;

  // Outer serrated gold circle effect (two concentric rings)
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.circle(sealX, sealY, 14, 'F');
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1.2);
  doc.circle(sealX, sealY, 14, 'S');
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.4);
  doc.circle(sealX, sealY, 12.2, 'S');

  // Inner Navy Center
  doc.setFillColor(10, 25, 47);
  doc.circle(sealX, sealY, 9.5, 'F');

  // Seal Text inside (with vector stars instead of unicode)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(254, 240, 138); // Yellow
  doc.text('FUTURE ACADEMY', sealX, sealY - 3, { align: 'center' });

  drawVectorStar(doc, sealX - 7.5, sealY + 0.8, 1.1, 0.45, [254, 240, 138]);
  doc.setFontSize(7);
  doc.text('VERIFIED', sealX, sealY + 1.2, { align: 'center' });
  drawVectorStar(doc, sealX + 7.5, sealY + 0.8, 1.1, 0.45, [254, 240, 138]);

  doc.setFontSize(5);
  doc.text('EXAM BOARD', sealX, sealY + 4.5, { align: 'center' });

  // Ribbon tails beneath the seal
  doc.setFillColor(217, 119, 6);
  doc.triangle(sealX - 7, sealY + 11, sealX - 3, sealY + 19, sealX - 1, sealY + 12, 'F');
  doc.triangle(sealX + 7, sealY + 11, sealX + 3, sealY + 19, sealX + 1, sealY + 12, 'F');

  // 9. Signatures (Left: Founder & CEO, Right: Controller of Examination)
  const sigLeftX = 112;
  const sigRightX = 224;
  const sigLineY = 163;

  // Left Signature (Engr Nadeem Ali - Founder & CEO)
  if (assets?.nadeemSigImg) {
    try {
      doc.addImage(assets.nadeemSigImg, 'PNG', sigLeftX - 26, sigLineY - 14, 52, 13.5);
    } catch {
      drawVectorNadeemSignature(doc, sigLeftX, sigLineY);
    }
  } else {
    drawVectorNadeemSignature(doc, sigLeftX, sigLineY);
  }

  // Left Signature Line & Title
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(sigLeftX - 28, sigLineY, sigLeftX + 28, sigLineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Engr Nadeem Ali', sigLeftX, sigLineY + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9); // Amber Gold
  doc.text('Founder & CEO', sigLeftX, sigLineY + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Future Academy Pro', sigLeftX, sigLineY + 11.5, { align: 'center' });

  // Right Signature (Dr. S. A. Rehman - Controller of Examinations)
  if (assets?.rehmanSigImg) {
    try {
      doc.addImage(assets.rehmanSigImg, 'PNG', sigRightX - 26, sigLineY - 14, 52, 13.5);
    } catch {
      drawVectorRehmanSignature(doc, sigRightX, sigLineY);
    }
  } else {
    drawVectorRehmanSignature(doc, sigRightX, sigLineY);
  }

  // Right Signature Line & Title
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(sigRightX - 28, sigLineY, sigRightX + 28, sigLineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Dr. S. A. Rehman', sigRightX, sigLineY + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('Controller of Examinations', sigRightX, sigLineY + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Future Academy Pro Certification Board', sigRightX, sigLineY + 11.5, { align: 'center' });

  // 10. Footer Security & Verification Details
  // Positioned at Y = 181 to give ample 14mm+ clearance above the inner border line (195.5mm)
  const footerY = 181;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);

  // Left: Certificate ID & Issue Date
  doc.text(`Certificate No: ${certId}`, 18, footerY);
  doc.text(`Date of Issue: ${dateStr}`, 18, footerY + 3.8);

  // Center: Verification Link
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(`Official Digital Verification: futureacademypro.com/verify/${certId}`, centerX, footerY + 2, { align: 'center' });

  // Right: QR Mock Security Stamp & Watermark
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized & Secured Electronic Credential', pageWidth - 18, footerY, { align: 'right' });
  doc.text('© Future Academy Pro. All Rights Reserved.', pageWidth - 18, footerY + 3.8, { align: 'right' });

  return doc;
};

// Vector Fallback for Left FA Logo
function drawVectorFaLogo(doc: jsPDF, cx: number, cy: number, r: number) {
  // Deep Royal Navy circle base
  doc.setFillColor(10, 25, 47);
  doc.circle(cx, cy, r, 'F');

  // Gold Inner Rim
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.circle(cx, cy, r - 1.2, 'S');

  // Graduation Cap / Mortarboard (Top)
  doc.setFillColor(245, 158, 11);
  doc.triangle(cx, cy - 6.5, cx - 6, cy - 3.5, cx + 6, cy - 3.5, 'F');
  doc.triangle(cx, cy - 1.5, cx - 6, cy - 3.5, cx + 6, cy - 3.5, 'F');
  // Tassel
  doc.setDrawColor(254, 240, 138);
  doc.setLineWidth(0.3);
  doc.line(cx + 4.5, cy - 3.5, cx + 6, cy - 0.5);

  // Monogram "FA"
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('FA', cx, cy + 3.5, { align: 'center' });

  // Open Book at Bottom
  doc.setFillColor(217, 119, 6);
  doc.triangle(cx - 5, cy + 6.5, cx, cy + 5, cx, cy + 7.5, 'F');
  doc.triangle(cx + 5, cy + 6.5, cx, cy + 5, cx, cy + 7.5, 'F');
}

// Vector Fallback for Right Pakistan Flag (Circular)
function drawVectorPakistanFlag(doc: jsPDF, cx: number, cy: number, r: number) {
  // Deep Pakistani Green Base Circle (#01411C)
  doc.setFillColor(1, 65, 28);
  doc.circle(cx, cy, r, 'F');

  // White Hoist Band on Left side (approx. 27% width)
  doc.setFillColor(255, 255, 255);
  doc.rect(cx - r + 1, cy - r + 3, r * 0.55, (r - 3) * 2, 'F');

  // Re-clip with outer circle border
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.circle(cx, cy, r, 'S');

  // Crescent Moon in Green Field (Center around cx + 3, cy)
  const crescentCx = cx + 3.2;
  const crescentCy = cy;
  // White outer crescent circle
  doc.setFillColor(255, 255, 255);
  doc.circle(crescentCx, crescentCy, 4.5, 'F');
  // Green inner cutout circle shifted slightly towards top-right
  doc.setFillColor(1, 65, 28);
  doc.circle(crescentCx + 1.2, crescentCy - 1.2, 3.8, 'F');

  // Five-Pointed Star tilted towards top-right
  drawVectorStar(doc, crescentCx + 3.2, crescentCy - 3.2, 1.4, 0.6, [255, 255, 255]);
}

// Circular Masking Image Loader for Logo (Removes square background corners!)
const loadCircularImage = (url: string): Promise<string | null> => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(img.src);

        // Circular clip path
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw image aspect fill
        const nw = img.naturalWidth || size;
        const nh = img.naturalHeight || size;
        const minDim = Math.min(nw, nh);
        const sx = (nw - minDim) / 2;
        const sy = (nh - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        ctx.restore();

        // Export as transparent circular PNG
        const circularDataUrl = canvas.toDataURL('image/png');
        resolve(circularDataUrl);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
    setTimeout(() => resolve(null), 1200);
  });
};

// Safe Image Loader for SVG/Standard images
const loadImgElement = (url: string): Promise<HTMLImageElement | null> => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
    setTimeout(() => resolve(null), 1000);
  });
};

// Vector Cursive Signature Fallbacks (When images are not preloaded)
function drawVectorNadeemSignature(doc: jsPDF, cx: number, lineY: number) {
  // Fluid calligraphic cursive name using Times-Italic font in executive ink blue
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(13);
  doc.setTextColor(13, 37, 76); // Royal Executive Ink Navy
  doc.text('Engr Nadeem Ali', cx, lineY - 3.5, { align: 'center' });

  // Calligraphic flourish under the cursive name
  doc.setDrawColor(13, 37, 76);
  doc.setLineWidth(0.5);
  doc.lines([
    [10, 1.2, 22, -2.2, 34, 0.8],
    [5, 1.0, 7, -1.5, 4, -2.6]
  ], cx - 17, lineY - 1.8);

  // Subtle ink dot at end of flourish
  doc.setFillColor(13, 37, 76);
  doc.circle(cx + 21, lineY - 3.6, 0.4, 'F');
}

function drawVectorRehmanSignature(doc: jsPDF, cx: number, lineY: number) {
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(13);
  doc.setTextColor(13, 37, 76);
  doc.text('Dr. S. A. Rehman', cx, lineY - 3.5, { align: 'center' });

  doc.setDrawColor(13, 37, 76);
  doc.setLineWidth(0.5);
  doc.lines([
    [9, -1.4, 20, 1.4, 32, -0.6],
    [4, -0.8, 6, 1.1, 2, 2.0]
  ], cx - 16, lineY - 1.8);

  doc.setFillColor(13, 37, 76);
  doc.circle(cx + 18, lineY - 0.4, 0.4, 'F');
}

export const downloadCertificatePdf = async (data: CertificateData): Promise<void> => {
  // Preload logo with circular mask, flag image, and realistic cursive signatures
  const [faLogoDataUrl, pakFlagImg, nadeemSigImg, rehmanSigImg] = await Promise.all([
    loadCircularImage('/future_academy_logo.jpg'),
    loadImgElement('/pakistan_flag_circle.svg'),
    createSignatureDataUrl({ name: 'Engr Nadeem Ali', style: 'executive' }),
    createSignatureDataUrl({ name: 'Dr. S. A. Rehman', style: 'academic' })
  ]);

  const doc = generateCertificatePdf(data, {
    faLogoImg: faLogoDataUrl,
    pakFlagImg: pakFlagImg,
    nadeemSigImg: nadeemSigImg,
    rehmanSigImg: rehmanSigImg
  });
  const safeName = (data.candidateName.trim() || 'Candidate').replace(/[^a-z0-9]/gi, '_');
  const safeTitle = (data.quizTitle || 'Quiz').replace(/[^a-z0-9]/gi, '_');
  doc.save(`Future_Academy_Pro_Certificate_${safeName}_${safeTitle}.pdf`);
};
