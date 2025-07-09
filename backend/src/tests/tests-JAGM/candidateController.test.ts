import { Request, Response } from 'express';
import { addCandidateController } from '../../presentation/controllers/candidateController';
import { addCandidate } from '../../application/services/candidateService';

// Mock del servicio
jest.mock('../../application/services/candidateService');

describe('addCandidateController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();

    // Mock del response con pattern fluent (status().json())
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        address: 'Test Street 123',
      },
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('Caso de éxito', () => {
    it('debería crear un candidato exitosamente y devolver status 201', async () => {
      // Arrange
      const mockCandidate = {
        id: 1,
        ...mockRequest.body,
      };
      (addCandidate as jest.Mock).mockResolvedValue(mockCandidate);

      // Act
      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(addCandidate).toHaveBeenCalledTimes(1);
      expect(addCandidate).toHaveBeenCalledWith(mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Candidate added successfully',
        data: mockCandidate,
      });
    });
  });

  describe('Casos de error', () => {
    it('debería manejar errores cuando el servicio lanza un Error', async () => {
      // Arrange
      const errorMessage = 'The email already exists in the database';
      (addCandidate as jest.Mock).mockRejectedValue(new Error(errorMessage));

      // Act
      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(addCandidate).toHaveBeenCalledWith(mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error adding candidate',
        error: errorMessage,
      });
    });

    it('debería manejar errores desconocidos cuando no es una instancia de Error', async () => {
      // Arrange
      (addCandidate as jest.Mock).mockRejectedValue('Unknown error string');

      // Act
      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(addCandidate).toHaveBeenCalledWith(mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error adding candidate',
        error: 'Unknown error',
      });
    });

    it('debería manejar cuando se lanza un objeto que no es Error', async () => {
      // Arrange
      (addCandidate as jest.Mock).mockRejectedValue({
        code: 'CUSTOM_ERROR',
        details: 'Some details',
      });

      // Act
      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(addCandidate).toHaveBeenCalledWith(mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error adding candidate',
        error: 'Unknown error',
      });
    });
  });
});
