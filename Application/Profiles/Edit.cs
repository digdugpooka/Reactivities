using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Profiles
{
    public class Edit
    {
        public class Command : IRequest
        {
            public string Username { get; set; }

            public string DisplayName { get; set; }

            public string Bio { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DisplayName).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly IUserAccessor userAccessor;
            private readonly UserManager<AppUser> userManager;

            public Handler(IUserAccessor userAccessor, UserManager<AppUser> userManager)
            {
                this.userManager = userManager;
                this.userAccessor = userAccessor;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                if (request.Username != userAccessor.GetCurrentUsername()) 
                    throw new RestException(HttpStatusCode.Unauthorized, new { Profile = "Not authorized to edit another user's profile."});

                var user = await userManager.FindByNameAsync(request.Username);
                if (user == null)
                    throw new RestException(HttpStatusCode.Unauthorized, new { User = "Not found. "});

                user.DisplayName = request.DisplayName;
                user.Bio = request.Bio;

                var result = await userManager.UpdateAsync(user);
                if (!result.Succeeded) 
                {
                    throw new RestException(HttpStatusCode.InternalServerError, new { User = "Could not update the user." });
                }
                
                // var success = await context.SaveChangesAsync() > 0; // SaveChangesAsync returns # of changes persisted to DB.
                return Unit.Value;

            }
        }
    }
}