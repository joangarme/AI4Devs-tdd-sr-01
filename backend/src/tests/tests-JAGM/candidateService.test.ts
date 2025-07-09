import { addCandidate } from '../../application/services/candidateService';
import { Candidate } from '../../domain/models/Candidate';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { validateCandidateData } from '../../application/validator';

// Mock de las clases de dominio
jest.mock('../../domain/models/Candidate');
jest.mock('../../domain/models/Education');
jest.mock('../../domain/models/WorkExperience');
jest.mock('../../domain/models/Resume');
jest.mock('../../application/validator');

describe('candidateService - addCandidate', () => {
  // Mocks tipados
  const mockCandidateSave = jest.fn();
  const mockEducationSave = jest.fn();
  const mockWorkExperienceSave = jest.fn();
  const mockResumeSave = jest.fn();

  beforeEach(() => {
    // Reset de todos los mocks antes de cada test
    jest.clearAllMocks();

    // Mock por defecto del validador que no lanza errores
    (validateCandidateData as jest.Mock).mockImplementation(() => {
      // No hacer nada - validación exitosa por defecto
    });

    // Mock del constructor y métodos de Candidate
    (Candidate as any).mockImplementation((data: any) => {
      return {
        ...data,
        education: [],
        workExperience: [],
        resumes: [],
        save: mockCandidateSave,
      };
    });

    // Mock del constructor y métodos de Education
    (Education as any).mockImplementation((data: any) => {
      return {
        ...data,
        save: mockEducationSave,
      };
    });

    // Mock del constructor y métodos de WorkExperience
    (WorkExperience as any).mockImplementation((data: any) => {
      return {
        ...data,
        save: mockWorkExperienceSave,
      };
    });

    // Mock del constructor y métodos de Resume
    (Resume as any).mockImplementation((data: any) => {
      return {
        ...data,
        save: mockResumeSave,
      };
    });
  });

  describe('Casos de éxito', () => {
    it('debería crear un candidato con todos los datos proporcionados', async () => {
      // Arrange
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        address: 'Test Street 123',
        educations: [
          {
            institution: 'Universidad Test',
            title: 'Ingeniería',
            startDate: '2020-01-01',
            endDate: '2024-01-01',
          },
        ],
        workExperiences: [
          {
            company: 'Test Company',
            position: 'Developer',
            description: 'Test description',
            startDate: '2024-01-01',
            endDate: '2024-12-01',
          },
        ],
        cv: {
          filePath: 'uploads/test.pdf',
          fileType: 'application/pdf',
        },
      };

      const savedCandidate = { id: 1, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);
      mockEducationSave.mockResolvedValue({ id: 1 });
      mockWorkExperienceSave.mockResolvedValue({ id: 1 });
      mockResumeSave.mockResolvedValue({ id: 1 });

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
      expect(Candidate).toHaveBeenCalledWith(candidateData);
      expect(mockCandidateSave).toHaveBeenCalledTimes(1);

      // Verificar que se guardaron las entidades relacionadas
      expect(Education).toHaveBeenCalledTimes(1);
      expect(mockEducationSave).toHaveBeenCalledTimes(1);

      expect(WorkExperience).toHaveBeenCalledTimes(1);
      expect(mockWorkExperienceSave).toHaveBeenCalledTimes(1);

      expect(Resume).toHaveBeenCalledTimes(1);
      expect(mockResumeSave).toHaveBeenCalledTimes(1);

      expect(result).toEqual(savedCandidate);
    });

    it('debería crear un candidato solo con datos básicos (sin educación, experiencia ni CV)', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '987654321',
        address: 'Another Street 456',
      };

      const savedCandidate = { id: 2, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
      expect(Candidate).toHaveBeenCalledWith(candidateData);
      expect(mockCandidateSave).toHaveBeenCalledTimes(1);

      // Verificar que NO se intentaron guardar entidades relacionadas
      expect(Education).not.toHaveBeenCalled();
      expect(WorkExperience).not.toHaveBeenCalled();
      expect(Resume).not.toHaveBeenCalled();

      expect(result).toEqual(savedCandidate);
    });

    it('debería manejar múltiples educaciones y experiencias laborales', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Multi',
        lastName: 'User',
        email: 'multi@example.com',
        educations: [
          {
            institution: 'Universidad 1',
            title: 'Título 1',
            startDate: '2020-01-01',
            endDate: '2022-01-01',
          },
          {
            institution: 'Universidad 2',
            title: 'Título 2',
            startDate: '2022-01-01',
            endDate: '2024-01-01',
          },
        ],
        workExperiences: [
          {
            company: 'Company 1',
            position: 'Position 1',
            startDate: '2022-01-01',
          },
          {
            company: 'Company 2',
            position: 'Position 2',
            startDate: '2023-01-01',
          },
        ],
      };

      const savedCandidate = { id: 3, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);
      mockEducationSave.mockResolvedValue({ id: 1 });
      mockWorkExperienceSave.mockResolvedValue({ id: 1 });

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(Education).toHaveBeenCalledTimes(2);
      expect(mockEducationSave).toHaveBeenCalledTimes(2);
      expect(WorkExperience).toHaveBeenCalledTimes(2);
      expect(mockWorkExperienceSave).toHaveBeenCalledTimes(2);
      expect(result).toEqual(savedCandidate);
    });
  });

  describe('Casos de error', () => {
    it('debería lanzar error cuando la validación falla', async () => {
      // Arrange
      const candidateData = {
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email',
      };
      const validationError = 'Invalid email format';
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(addCandidate(candidateData)).rejects.toThrow(
        validationError,
      );
      expect(Candidate).not.toHaveBeenCalled();
      expect(mockCandidateSave).not.toHaveBeenCalled();
    });

    it('debería lanzar error específico cuando el email ya existe (P2002)', async () => {
      // Arrange
      const candidateData = {
        firstName: 'John',
        lastName: 'Duplicate',
        email: 'existing@example.com',
      };
      const prismaError = { code: 'P2002' };
      mockCandidateSave.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(addCandidate(candidateData)).rejects.toThrow(
        'The email already exists in the database',
      );
    });

    it('debería propagar errores genéricos al guardar el candidato', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Error',
        lastName: 'Test',
        email: 'error@example.com',
      };
      const genericError = new Error('Database connection failed');
      mockCandidateSave.mockRejectedValue(genericError);

      // Act & Assert
      await expect(addCandidate(candidateData)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('debería manejar errores al guardar la educación', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Education',
        lastName: 'Error',
        email: 'education.error@example.com',
        educations: [
          {
            institution: 'Test University',
            title: 'Test Degree',
            startDate: '2020-01-01',
          },
        ],
      };
      const savedCandidate = { id: 4, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);
      mockEducationSave.mockRejectedValue(
        new Error('Failed to save education'),
      );

      // Act & Assert
      await expect(addCandidate(candidateData)).rejects.toThrow(
        'Failed to save education',
      );
      expect(mockCandidateSave).toHaveBeenCalledTimes(1);
      expect(Education).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores al guardar la experiencia laboral', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Experience',
        lastName: 'Error',
        email: 'experience.error@example.com',
        workExperiences: [
          {
            company: 'Test Company',
            position: 'Test Position',
            startDate: '2020-01-01',
          },
        ],
      };
      const savedCandidate = { id: 5, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);
      mockWorkExperienceSave.mockRejectedValue(
        new Error('Failed to save work experience'),
      );

      // Act & Assert
      await expect(addCandidate(candidateData)).rejects.toThrow(
        'Failed to save work experience',
      );
    });

    it('debería manejar errores al guardar el CV', async () => {
      // Arrange
      const candidateData = {
        firstName: 'CV',
        lastName: 'Error',
        email: 'cv.error@example.com',
        cv: {
          filePath: 'uploads/error.pdf',
          fileType: 'application/pdf',
        },
      };
      const savedCandidate = { id: 6, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);
      mockResumeSave.mockRejectedValue(new Error('Failed to save resume'));

      // Act & Assert
      await expect(addCandidate(candidateData)).rejects.toThrow(
        'Failed to save resume',
      );
    });
  });

  describe('Casos límite', () => {
    it('debería manejar arrays vacíos para educaciones y experiencias', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Empty',
        lastName: 'Arrays',
        email: 'empty@example.com',
        educations: [],
        workExperiences: [],
      };
      const savedCandidate = { id: 7, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(Education).not.toHaveBeenCalled();
      expect(WorkExperience).not.toHaveBeenCalled();
      expect(result).toEqual(savedCandidate);
    });

    it('debería manejar un objeto CV vacío', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Empty',
        lastName: 'CV',
        email: 'emptycv@example.com',
        cv: {},
      };
      const savedCandidate = { id: 8, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(Resume).not.toHaveBeenCalled();
      expect(result).toEqual(savedCandidate);
    });

    it('debería manejar valores null y undefined en campos opcionales', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Nullable',
        lastName: 'Fields',
        email: 'nullable@example.com',
        phone: null,
        address: undefined,
        educations: null,
        workExperiences: undefined,
        cv: null,
      };
      const savedCandidate = { id: 9, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(result).toEqual(savedCandidate);
      expect(Education).not.toHaveBeenCalled();
      expect(WorkExperience).not.toHaveBeenCalled();
      expect(Resume).not.toHaveBeenCalled();
    });

    it('debería asignar correctamente el candidateId a las entidades relacionadas', async () => {
      // Arrange
      const candidateData = {
        firstName: 'ID',
        lastName: 'Assignment',
        email: 'id@example.com',
        educations: [
          {
            institution: 'Test',
            title: 'Test',
            startDate: '2020-01-01',
          },
        ],
        workExperiences: [
          {
            company: 'Test',
            position: 'Test',
            startDate: '2020-01-01',
          },
        ],
        cv: {
          filePath: 'test.pdf',
          fileType: 'application/pdf',
        },
      };
      const savedCandidate = { id: 10, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);
      mockEducationSave.mockResolvedValue({ id: 1 });
      mockWorkExperienceSave.mockResolvedValue({ id: 1 });
      mockResumeSave.mockResolvedValue({ id: 1 });

      // Act
      await addCandidate(candidateData);

      // Assert
      // Verificar que se asignó el candidateId a cada entidad
      const educationInstance = (Education as any).mock.results[0].value;
      expect(educationInstance.candidateId).toBe(10);

      const workExperienceInstance = (WorkExperience as any).mock.results[0]
        .value;
      expect(workExperienceInstance.candidateId).toBe(10);

      const resumeInstance = (Resume as any).mock.results[0].value;
      expect(resumeInstance.candidateId).toBe(10);
    });

    it('debería procesar correctamente fechas sin endDate', async () => {
      // Arrange
      const candidateData = {
        firstName: 'No',
        lastName: 'EndDate',
        email: 'noenddate@example.com',
        educations: [
          {
            institution: 'Current University',
            title: 'Ongoing Degree',
            startDate: '2023-01-01',
            // Sin endDate - estudiando actualmente
          },
        ],
        workExperiences: [
          {
            company: 'Current Company',
            position: 'Current Position',
            description: 'Currently working',
            startDate: '2023-06-01',
            // Sin endDate - trabajando actualmente
          },
        ],
      };
      const savedCandidate = { id: 11, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);
      mockEducationSave.mockResolvedValue({ id: 1 });
      mockWorkExperienceSave.mockResolvedValue({ id: 1 });

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(result).toEqual(savedCandidate);
      expect(mockEducationSave).toHaveBeenCalledTimes(1);
      expect(mockWorkExperienceSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Verificación de orden de operaciones', () => {
    it('debería ejecutar las operaciones en el orden correcto', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Order',
        lastName: 'Test',
        email: 'order@example.com',
        educations: [
          { institution: 'Test', title: 'Test', startDate: '2020-01-01' },
        ],
        workExperiences: [
          { company: 'Test', position: 'Test', startDate: '2020-01-01' },
        ],
        cv: { filePath: 'test.pdf', fileType: 'application/pdf' },
      };
      const savedCandidate = { id: 12, ...candidateData };
      mockCandidateSave.mockResolvedValue(savedCandidate);

      const callOrder: string[] = [];
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        callOrder.push('validate');
      });
      mockCandidateSave.mockImplementation(async () => {
        callOrder.push('save-candidate');
        return savedCandidate;
      });
      mockEducationSave.mockImplementation(async () => {
        callOrder.push('save-education');
        return { id: 1 };
      });
      mockWorkExperienceSave.mockImplementation(async () => {
        callOrder.push('save-experience');
        return { id: 1 };
      });
      mockResumeSave.mockImplementation(async () => {
        callOrder.push('save-resume');
        return { id: 1 };
      });

      // Act
      await addCandidate(candidateData);

      // Assert
      expect(callOrder).toEqual([
        'validate',
        'save-candidate',
        'save-education',
        'save-experience',
        'save-resume',
      ]);
    });
  });
});
