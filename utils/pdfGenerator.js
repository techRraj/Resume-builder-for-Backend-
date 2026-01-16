const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.fonts = {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique'
    };
  }

  // Generate PDF using PDFKit
  async generateWithPDFKit(resume, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: resume.title,
            Author: resume.content.personal?.name || 'Resume Builder',
            Creator: 'Resume Builder Pro',
            CreationDate: new Date()
          }
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Add content
        this.addHeader(doc, resume);
        this.addSummary(doc, resume);
        this.addExperience(doc, resume);
        this.addEducation(doc, resume);
        this.addSkills(doc, resume);
        this.addProjects(doc, resume);
        this.addFooter(doc, resume);

        doc.end();

        stream.on('finish', () => resolve({ path: outputPath }));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  addHeader(doc, resume) {
    const { personal } = resume.content;
    const colors = resume.style?.theme || { primary: '#2563eb', text: '#1f2937' };

    // Name
    doc.font(this.fonts.bold)
       .fontSize(24)
       .fillColor(colors.text || '#1f2937')
       .text(personal?.name || '', { align: 'center' })
       .moveDown(0.5);

    // Title
    doc.font(this.fonts.normal)
       .fontSize(14)
       .fillColor(colors.primary || '#2563eb')
       .text(personal?.title || '', { align: 'center' })
       .moveDown(1);

    // Contact info
    const contactInfo = [];
    if (personal?.email) contactInfo.push(personal.email);
    if (personal?.phone) contactInfo.push(personal.phone);
    if (personal?.location) contactInfo.push(personal.location);

    if (contactInfo.length > 0) {
      doc.font(this.fonts.normal)
         .fontSize(10)
         .fillColor('#666666')
         .text(contactInfo.join(' • '), { align: 'center' })
         .moveDown(2);
    }

    // Separator line
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .lineWidth(1)
       .strokeColor(colors.primary || '#2563eb')
       .stroke()
       .moveDown(2);
  }

  addSummary(doc, resume) {
    const { personal } = resume.content;
    
    if (personal?.summary) {
      this.addSectionHeader(doc, 'PROFESSIONAL SUMMARY');
      
      doc.font(this.fonts.normal)
         .fontSize(11)
         .fillColor('#333333')
         .text(personal.summary, {
           align: 'justify',
           lineGap: 4
         })
         .moveDown(2);
    }
  }

  addExperience(doc, resume) {
    const { experience } = resume.content;
    
    if (experience?.length > 0) {
      this.addSectionHeader(doc, 'WORK EXPERIENCE');
      
      experience.forEach((exp, index) => {
        // Role and Company
        doc.font(this.fonts.bold)
           .fontSize(12)
           .fillColor('#333333')
           .text(exp.role || '')
           .moveDown(0.2);
        
        // Company and Duration
        doc.font(this.fonts.italic)
           .fontSize(10)
           .fillColor('#666666');
        
        const companyInfo = [];
        if (exp.company) companyInfo.push(exp.company);
        if (exp.duration) companyInfo.push(exp.duration);
        
        if (companyInfo.length > 0) {
          doc.text(companyInfo.join(' • '));
        }
        
        // Description
        if (exp.description) {
          doc.moveDown(0.3)
             .font(this.fonts.normal)
             .fontSize(10)
             .fillColor('#444444')
             .text(exp.description, {
               align: 'justify',
               lineGap: 3
             });
        }
        
        // Add space between experiences
        if (index < experience.length - 1) {
          doc.moveDown(1);
        }
      });
      
      doc.moveDown(2);
    }
  }

  addEducation(doc, resume) {
    const { education } = resume.content;
    
    if (education?.length > 0) {
      this.addSectionHeader(doc, 'EDUCATION');
      
      education.forEach((edu, index) => {
        // Degree
        doc.font(this.fonts.bold)
           .fontSize(11)
           .fillColor('#333333')
           .text(edu.degree || '')
           .moveDown(0.2);
        
        // Institute and Year
        doc.font(this.fonts.normal)
           .fontSize(10)
           .fillColor('#666666');
        
        const eduInfo = [];
        if (edu.institute) eduInfo.push(edu.institute);
        if (edu.year) eduInfo.push(edu.year);
        
        if (eduInfo.length > 0) {
          doc.text(eduInfo.join(' • '));
        }
        
        if (index < education.length - 1) {
          doc.moveDown(0.8);
        }
      });
      
      doc.moveDown(2);
    }
  }

  addSkills(doc, resume) {
    const { skills } = resume.content;
    
    if (skills?.length > 0) {
      this.addSectionHeader(doc, 'SKILLS');
      
      // Convert skills to simple array if they're objects
      const skillList = skills.map(skill => 
        typeof skill === 'object' ? skill.name || skill : skill
      ).filter(Boolean);
      
      if (skillList.length > 0) {
        const chunkSize = 3;
        const chunks = [];
        
        for (let i = 0; i < skillList.length; i += chunkSize) {
          chunks.push(skillList.slice(i, i + chunkSize));
        }
        
        chunks.forEach(chunk => {
          const y = doc.y;
          const columnWidth = 150;
          
          chunk.forEach((skill, index) => {
            const x = 50 + (index * columnWidth);
            
            doc.font(this.fonts.normal)
               .fontSize(10)
               .fillColor('#333333')
               .text('• ' + skill, x, y, {
                 width: columnWidth - 20,
                 continued: false
               });
          });
          
          doc.moveDown(0.5);
        });
        
        doc.moveDown(2);
      }
    }
  }

  addProjects(doc, resume) {
    const { projects } = resume.content;
    
    if (projects?.length > 0) {
      this.addSectionHeader(doc, 'PROJECTS');
      
      projects.forEach((proj, index) => {
        // Project Name
        doc.font(this.fonts.bold)
           .fontSize(11)
           .fillColor('#333333')
           .text(proj.name || '')
           .moveDown(0.2);
        
        // Technologies
        if (proj.tech) {
          doc.font(this.fonts.italic)
             .fontSize(9)
             .fillColor('#666666')
             .text(proj.tech)
             .moveDown(0.2);
        }
        
        // Description
        if (proj.desc) {
          doc.font(this.fonts.normal)
             .fontSize(10)
             .fillColor('#444444')
             .text(proj.desc, {
               align: 'justify',
               lineGap: 3
             });
        }
        
        if (index < projects.length - 1) {
          doc.moveDown(1);
        }
      });
      
      doc.moveDown(2);
    }
  }

  addSectionHeader(doc, title) {
    doc.font(this.fonts.bold)
       .fontSize(14)
       .fillColor('#2563eb')
       .text(title)
       .moveDown(0.5);
    
    // Underline
    const y = doc.y;
    doc.moveTo(50, y)
       .lineTo(150, y)
       .lineWidth(2)
       .strokeColor('#2563eb')
       .stroke()
       .moveDown(0.5);
  }

  addFooter(doc, resume) {
    const footerY = 750;
    
    doc.font(this.fonts.normal)
       .fontSize(8)
       .fillColor('#999999')
       .text(
         `Generated with Resume Builder Pro • ${new Date().toLocaleDateString()}`,
         50,
         footerY,
         { align: 'center', width: 500 }
       );
  }

  // Generate multiple formats
  async generateAllFormats(resume, outputDir) {
    const formats = {};
    
    try {
      // Generate PDF
      const pdfFilename = `${resume.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const pdfPath = path.join(outputDir, pdfFilename);
      
      await this.generateWithPDFKit(resume, pdfPath);
      
      formats.pdf = {
        success: true,
        path: pdfPath,
        url: `/exports/${pdfFilename}`,
        size: fs.statSync(pdfPath).size
      };

      // Generate TXT
      const txtFilename = `${resume.title.replace(/\s+/g, '_')}_${Date.now()}.txt`;
      const txtPath = path.join(outputDir, txtFilename);
      this.generateText(resume, txtPath);
      
      formats.txt = {
        success: true,
        path: txtPath,
        url: `/exports/${txtFilename}`,
        size: fs.statSync(txtPath).size
      };

    } catch (error) {
      console.error('PDF generation error:', error);
      formats.error = error.message;
    }
    
    return formats;
  }

  generateText(resume, outputPath) {
    const { personal, experience, education, skills, projects } = resume.content;
    let text = '';
    
    // Header
    text += `${personal?.name || ''}\n`;
    text += `${personal?.title || ''}\n\n`;
    
    // Contact
    if (personal?.email) text += `Email: ${personal.email}\n`;
    if (personal?.phone) text += `Phone: ${personal.phone}\n`;
    if (personal?.location) text += `Location: ${personal.location}\n`;
    text += '\n';
    
    // Summary
    if (personal?.summary) {
      text += 'SUMMARY\n';
      text += '=======\n';
      text += `${personal.summary}\n\n`;
    }
    
    // Experience
    if (experience?.length > 0) {
      text += 'EXPERIENCE\n';
      text += '==========\n';
      experience.forEach(exp => {
        text += `${exp.role || ''}\n`;
        if (exp.company) text += `${exp.company}\n`;
        if (exp.duration) text += `${exp.duration}\n`;
        if (exp.description) text += `${exp.description}\n`;
        text += '\n';
      });
    }
    
    // Education
    if (education?.length > 0) {
      text += 'EDUCATION\n';
      text += '=========\n';
      education.forEach(edu => {
        text += `${edu.degree || ''}\n`;
        if (edu.institute) text += `${edu.institute}\n`;
        if (edu.year) text += `${edu.year}\n`;
        text += '\n';
      });
    }
    
    // Skills
    if (skills?.length > 0) {
      text += 'SKILLS\n';
      text += '======\n';
      const skillList = skills.map(skill => 
        typeof skill === 'object' ? skill.name || skill : skill
      ).filter(Boolean);
      text += `${skillList.join(', ')}\n\n`;
    }
    
    // Footer
    text += `\nGenerated with Resume Builder Pro • ${new Date().toLocaleDateString()}`;
    
    fs.writeFileSync(outputPath, text);
  }
}

module.exports = new PDFGenerator();