using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Details
    {

        public class Query : IRequest<ActivityDto>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, ActivityDto>
        {
            private readonly DataContext context;
            private readonly IMapper mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                this.mapper = mapper;
                this.context = context;

            }
            public async Task<ActivityDto> Handle(Query request, CancellationToken cancellationToken)
            {
                var activity = await context.Activities
                    .SingleOrDefaultAsync(a => a.Id == request.Id);

                if (activity == null)
                {
                    throw new RestException(HttpStatusCode.NotFound, new { activity = "Not Found" });
                }

                // Use AutoMapper to map our domain entities to DTOs.
                var activityToReturn = mapper.Map<Activity, ActivityDto>(activity);
                return activityToReturn;
            }
        }
    }
}