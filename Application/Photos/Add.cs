using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Linq;

namespace Application.Photos
{
    public class Add
    {
        public class Command : IRequest<Photo>
        {
            public IFormFile File { get; set; }
        }

        public class Handler : IRequestHandler<Command, Photo>
        {
            private readonly DataContext context;
            private readonly IUserAccessor userAccessor;
            private readonly IPhotoAccessor photoAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor, IPhotoAccessor photoAccessor)
            {
                this.photoAccessor = photoAccessor;
                this.userAccessor = userAccessor;
                this.context = context;
            }

            public async Task<Photo> Handle(Command request, CancellationToken cancellationToken)
            {
                
                var photoUploadResult = photoAccessor.AddPhoto(request.File);
                var user = await this.context.Users
                    .Include(u => u.Photos)
                    .SingleOrDefaultAsync(x => x.UserName == userAccessor.GetCurrentUsername());

                var photo = new Photo
                {
                    Url = photoUploadResult.Url,
                    Id = photoUploadResult.PublicId
                };

                if (!user.Photos.Any(x => x.IsMain))
                {
                    photo.IsMain = true;
                }
                user.Photos.Add(photo);

                var success = await context.SaveChangesAsync() > 0; // SaveChangesAsync returns # of changes persisted to DB.
                if (success) return photo;

                throw new Exception("Problem saving activity");
            }
        }
    }
}